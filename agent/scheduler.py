import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from agent.utils.config import ScheduleConfig
from agent.orchestrator import Orchestrator

logger = logging.getLogger("twitter_agent")


class AgentScheduler:
    """Schedules daily discovery and generation jobs."""

    def __init__(self, config: ScheduleConfig, orchestrator: Orchestrator):
        self.config = config
        self.orchestrator = orchestrator
        self.scheduler = AsyncIOScheduler(timezone=config.timezone)

    def start(self):
        if not self.config.enabled:
            logger.info("Scheduler disabled in config")
            return

        # Schedule discovery jobs
        for time_str in self.config.discovery_times:
            hour, minute = time_str.split(":")
            self.scheduler.add_job(
                self.orchestrator.run_discovery,
                CronTrigger(hour=int(hour), minute=int(minute)),
                id=f"discovery_{time_str}",
                name=f"Tweet Discovery at {time_str}",
                misfire_grace_time=300,
            )
            logger.info(f"Scheduled discovery at {time_str}")

        # Schedule generation jobs
        for time_str in self.config.generation_times:
            hour, minute = time_str.split(":")
            self.scheduler.add_job(
                self.orchestrator.run_generation,
                CronTrigger(hour=int(hour), minute=int(minute)),
                id=f"generation_{time_str}",
                name=f"Tweet Generation at {time_str}",
                misfire_grace_time=300,
            )
            logger.info(f"Scheduled generation at {time_str}")

        self.scheduler.start()
        logger.info("Scheduler started")

    def stop(self):
        if self.scheduler.running:
            self.scheduler.shutdown()
            logger.info("Scheduler stopped")
