FROM php:8.4-fpm-alpine

# システム依存
RUN apk add --no-cache \
      git \
      unzip \
      icu-dev \
      oniguruma-dev \
      libzip-dev \
      libpng-dev \
      libjpeg-turbo-dev \
      freetype-dev \
      $PHPIZE_DEPS

# PHP 拡張
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
 && docker-php-ext-install -j$(nproc) \
      pdo_mysql \
      mbstring \
      bcmath \
      intl \
      zip \
      gd \
      pcntl \
      opcache

# Redis 拡張
RUN pecl install redis \
 && docker-php-ext-enable redis

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# php-fpm はデフォルトの 9000 で待受
EXPOSE 9000
CMD ["php-fpm"]
