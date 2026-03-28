FROM php:8.3-cli
RUN docker-php-ext-install pdo pdo_mysql
COPY . /var/www/server
WORKDIR /var/www/server
CMD ["php","-S","0.0.0.0:80","index.php"]
