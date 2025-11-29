-- =============================================================
-- 0. 데이터베이스 & 전용 계정 생성
--    (root 계정으로 한 번만 실행)
-- =============================================================

CREATE DATABASE IF NOT EXISTS db_sunwoong_shop
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_general_ci;

-- EC2에 MySQL이 localhost 기준으로 떠있다는 가정
-- 비밀번호는 본인이 원하는 걸로 바꿔서 사용
CREATE USER IF NOT EXISTS 'sunwoong_shop'@'localhost' IDENTIFIED BY '강력한_비밀번호_여기에';
GRANT ALL PRIVILEGES ON db_sunwoong_shop.* TO 'sunwoong_shop'@'localhost';
FLUSH PRIVILEGES;

USE db_sunwoong_shop;

-- =============================================================
-- 1. 마스터/코드 테이블
--    user_grades, genders, category_groups, categories, brands
-- =============================================================

CREATE TABLE IF NOT EXISTS user_grades (
  grade_code       VARCHAR(20)  NOT NULL,              -- BRONZE, SILVER ...
  name             VARCHAR(50)  NOT NULL,              -- 브론즈, 실버 ...
  min_total_spent  INT          NOT NULL DEFAULT 0,    -- 이 금액 이상부터 이 등급
  discount_rate    DECIMAL(4,3) NOT NULL DEFAULT 0.000, -- 0.020 = 2% 할인
  earn_rate        DECIMAL(4,3) NOT NULL DEFAULT 0.000, -- 0.030 = 3% 적립
  display_order    INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (grade_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS genders (
  gender_id   INT          NOT NULL AUTO_INCREMENT,
  code        VARCHAR(20)  NOT NULL,     -- MEN, WOMEN, UNISEX
  name        VARCHAR(50)  NOT NULL,     -- 남성, 여성, 공용
  PRIMARY KEY (gender_id),
  UNIQUE KEY uq_genders_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS category_groups (
  group_id       INT          NOT NULL AUTO_INCREMENT,
  code           VARCHAR(20)  NOT NULL,   -- TOP, BTM, SHOES, ACC
  name           VARCHAR(50)  NOT NULL,   -- 상의, 하의, 신발, 악세서리
  display_order  INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (group_id),
  UNIQUE KEY uq_category_groups_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS categories (
  category_id    INT          NOT NULL AUTO_INCREMENT,
  group_id       INT          NOT NULL,
  code           VARCHAR(50)  NOT NULL,     -- HOODIE, SHIRT ...
  name           VARCHAR(100) NOT NULL,     -- 후드티, 셔츠 ...
  display_order  INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (category_id),
  UNIQUE KEY uq_categories_code (code),
  CONSTRAINT fk_categories_group
    FOREIGN KEY (group_id)
    REFERENCES category_groups (group_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS brands (
  brand_id   INT          NOT NULL AUTO_INCREMENT,
  name       VARCHAR(100) NOT NULL,   -- Nike, Adidas ...
  code       VARCHAR(50)  DEFAULT NULL, -- NIKE, ADIDAS ...
  logo_url   VARCHAR(500) DEFAULT NULL,
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (brand_id),
  UNIQUE KEY uq_brands_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================
-- 2. 엔티티 테이블
--    users, products, product_images
-- =============================================================

CREATE TABLE IF NOT EXISTS users (
  user_id      INT          NOT NULL AUTO_INCREMENT,
  email        VARCHAR(255) NOT NULL,
  password     VARCHAR(255) NOT NULL,
  user_name    VARCHAR(50)  NOT NULL,
  is_admin     TINYINT(1)   NOT NULL DEFAULT 0,  -- 관리자 여부
  grade_code   VARCHAR(20)  NOT NULL DEFAULT 'BRONZE',
  point        INT          NOT NULL DEFAULT 0,
  total_spent  INT          NOT NULL DEFAULT 0,
  created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  UNIQUE KEY uq_users_email (email),
  CONSTRAINT fk_users_grade
    FOREIGN KEY (grade_code)
    REFERENCES user_grades (grade_code)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS products (
  product_id          INT          NOT NULL AUTO_INCREMENT,
  external_id         INT          DEFAULT NULL,         -- DummyJSON id
  gender_id           INT          DEFAULT NULL,         -- 남성/여성/공용 (선택)
  category_id         INT          NOT NULL,
  brand_id            INT          DEFAULT NULL,
  name                VARCHAR(255) NOT NULL,
  description         TEXT         DEFAULT NULL,
  price_krw           INT          NOT NULL,             -- 원화 가격
  discount_percentage DECIMAL(5,2) DEFAULT 0.00,         -- 상품 자체 할인율(%)
  stock               INT          NOT NULL DEFAULT 0,
  is_sold_out         TINYINT(1)   NOT NULL DEFAULT 0,   -- 품절 여부
  thumbnail_url       VARCHAR(500) DEFAULT NULL,
  view_count          INT          NOT NULL DEFAULT 0,
  created_at          DATETIME     DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (product_id),
  KEY idx_products_category (category_id),
  KEY idx_products_brand (brand_id),
  KEY idx_products_gender (gender_id),
  CONSTRAINT fk_products_category
    FOREIGN KEY (category_id)
    REFERENCES categories (category_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_products_brand
    FOREIGN KEY (brand_id)
    REFERENCES brands (brand_id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  CONSTRAINT fk_products_gender
    FOREIGN KEY (gender_id)
    REFERENCES genders (gender_id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS product_images (
  image_id       INT          NOT NULL AUTO_INCREMENT,
  product_id     INT          NOT NULL,
  image_url      VARCHAR(500) NOT NULL,
  display_order  INT          NOT NULL DEFAULT 0,
  is_thumbnail   TINYINT(1)   NOT NULL DEFAULT 0, -- 1이면 썸네일로 사용 가능
  PRIMARY KEY (image_id),
  KEY idx_product_images_product (product_id),
  CONSTRAINT fk_product_images_product
    FOREIGN KEY (product_id)
    REFERENCES products (product_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================
-- 3. 상호작용 테이블
--    cart_items, orders, order_items, favorites
-- =============================================================

CREATE TABLE IF NOT EXISTS cart_items (
  cart_item_id  INT       NOT NULL AUTO_INCREMENT,
  user_id       INT       NOT NULL,
  product_id    INT       NOT NULL,
  quantity      INT       NOT NULL DEFAULT 1,
  created_at    DATETIME  DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (cart_item_id),
  UNIQUE KEY uq_cart_user_product (user_id, product_id),
  CONSTRAINT fk_cart_items_user
    FOREIGN KEY (user_id)
    REFERENCES users (user_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_cart_items_product
    FOREIGN KEY (product_id)
    REFERENCES products (product_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS orders (
  order_id               INT         NOT NULL AUTO_INCREMENT,
  user_id                INT         NOT NULL,
  order_status           VARCHAR(20) NOT NULL DEFAULT 'PAID', 
  total_original_price   INT         NOT NULL,  -- 할인 전 총액
  total_discounted_price INT         NOT NULL,  -- 최종 결제 금액
  total_earned_point     INT         NOT NULL,  -- 적립 포인트 총합
  refunded_amount        INT         NOT NULL DEFAULT 0, -- 환불 금액
  created_at             DATETIME    DEFAULT CURRENT_TIMESTAMP,
  refunded_at            DATETIME    DEFAULT NULL,
  PRIMARY KEY (order_id),
  KEY idx_orders_user (user_id),
  CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id)
    REFERENCES users (user_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS order_items (
  order_item_id          INT        NOT NULL AUTO_INCREMENT,
  order_id               INT        NOT NULL,
  product_id             INT        NOT NULL,
  quantity               INT        NOT NULL,
  unit_original_price    INT        NOT NULL, -- 개당 정가
  unit_discounted_price  INT        NOT NULL, -- 개당 할인 적용 가격
  earned_point           INT        NOT NULL, -- 이 아이템으로 적립된 포인트
  PRIMARY KEY (order_item_id),
  KEY idx_order_items_order (order_id),
  KEY idx_order_items_product (product_id),
  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id)
    REFERENCES orders (order_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product
    FOREIGN KEY (product_id)
    REFERENCES products (product_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS favorites (
  favorite_id  INT       NOT NULL AUTO_INCREMENT,
  user_id      INT       NOT NULL,
  product_id   INT       NOT NULL,
  created_at   DATETIME  DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (favorite_id),
  UNIQUE KEY uq_favorites_user_product (user_id, product_id),
  CONSTRAINT fk_favorites_user
    FOREIGN KEY (user_id)
    REFERENCES users (user_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_favorites_product
    FOREIGN KEY (product_id)
    REFERENCES products (product_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================
-- 4. 기본 데이터(seed data) 삽입
-- =============================================================

INSERT INTO user_grades (grade_code, name, min_total_spent, discount_rate, earn_rate, display_order)
VALUES
('BRONZE', '브론즈', 0,      0.00, 0.01, 1),
('SILVER', '실버',   100000, 0.02, 0.02, 2),
('GOLD',   '골드',   300000, 0.05, 0.03, 3),
('VIP',    'VIP',    500000, 0.10, 0.05, 4)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  min_total_spent = VALUES(min_total_spent),
  discount_rate   = VALUES(discount_rate),
  earn_rate       = VALUES(earn_rate),
  display_order   = VALUES(display_order);

INSERT INTO genders (code, name)
VALUES
('MEN', '남성'),
('WOMEN', '여성'),
('UNISEX', '공용')
ON DUPLICATE KEY UPDATE
  name = VALUES(name);

INSERT INTO category_groups (code, name, display_order)
VALUES
('TOP',   '상의',     1),
('BTM',   '하의',     2),
('SHOES', '신발',     3),
('ACC',   '악세서리', 4)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  display_order = VALUES(display_order);

INSERT INTO categories (group_id, code, name, display_order)
VALUES
((SELECT group_id FROM category_groups WHERE code = 'TOP'), 'TSHIRT', '반팔 티셔츠', 1),
((SELECT group_id FROM category_groups WHERE code = 'TOP'), 'SHIRT',  '셔츠',       2),
((SELECT group_id FROM category_groups WHERE code = 'TOP'), 'HOODIE', '후드티',     3),
((SELECT group_id FROM category_groups WHERE code = 'TOP'), 'SWEAT',  '맨투맨',     4),
((SELECT group_id FROM category_groups WHERE code = 'TOP'), 'KNIT',   '니트',       5),
((SELECT group_id FROM category_groups WHERE code = 'TOP'), 'BLOUSE', '블라우스',   6),
((SELECT group_id FROM category_groups WHERE code = 'TOP'), 'DRESS',  '원피스',     7)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  group_id = VALUES(group_id),
  display_order = VALUES(display_order);

INSERT INTO categories (group_id, code, name, display_order)
VALUES
((SELECT group_id FROM category_groups WHERE code = 'BTM'), 'JEANS',  '청바지',   1),
((SELECT group_id FROM category_groups WHERE code = 'BTM'), 'SLACKS', '슬랙스',   2),
((SELECT group_id FROM category_groups WHERE code = 'BTM'), 'SHORTS', '반바지',   3),
((SELECT group_id FROM category_groups WHERE code = 'BTM'), 'SKIRT',  '스커트',   4),
((SELECT group_id FROM category_groups WHERE code = 'BTM'), 'JOGGER', '조거팬츠', 5)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  group_id = VALUES(group_id),
  display_order = VALUES(display_order);

INSERT INTO categories (group_id, code, name, display_order)
VALUES
((SELECT group_id FROM category_groups WHERE code = 'SHOES'), 'SNEAKERS', '스니커즈', 1),
((SELECT group_id FROM category_groups WHERE code = 'SHOES'), 'LOAFERS',  '로퍼',     2),
((SELECT group_id FROM category_groups WHERE code = 'SHOES'), 'BOOTS',    '부츠',     3),
((SELECT group_id FROM category_groups WHERE code = 'SHOES'), 'HEELS',    '힐',       4)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  group_id = VALUES(group_id),
  display_order = VALUES(display_order);

INSERT INTO categories (group_id, code, name, display_order)
VALUES
((SELECT group_id FROM category_groups WHERE code = 'ACC'), 'CAP',    '모자',  1),
((SELECT group_id FROM category_groups WHERE code = 'ACC'), 'BAG',    '가방',  2),
((SELECT group_id FROM category_groups WHERE code = 'ACC'), 'BELT',   '벨트',  3),
((SELECT group_id FROM category_groups WHERE code = 'ACC'), 'WALLET', '지갑',  4)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  group_id = VALUES(group_id),
  display_order = VALUES(display_order);
