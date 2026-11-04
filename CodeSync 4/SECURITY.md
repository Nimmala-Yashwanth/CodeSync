# Security policy

CodeSync is a portfolio project for trusted local development. It has not undergone an independent security audit.

**Do not deploy the optional code runner to the public internet.** Leave `ENABLE_CODE_EXECUTION=false`. The current timeout implementation kills the Docker CLI but may leave containers alive. Harden cleanup and validate resource controls before any experimental local use.

Never commit `.env`, secrets, database dumps, account credentials, or invitation tokens. Report vulnerabilities privately to the repository maintainer rather than posting exploit details publicly.
