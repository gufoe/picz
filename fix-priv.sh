find . -type d -exec chmod 775 {} +
find . -type f -exec chmod 664 {} +
chmod 660 .env
