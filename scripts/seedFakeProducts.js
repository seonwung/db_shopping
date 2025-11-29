// scripts/seedFakeProducts.js
// 역할: 우리가 설계한 스키마에 맞춰 brands / products / product_images 더미 데이터를 자동 생성
// 실행 방법: node scripts/seedFakeProducts.js

import 'dotenv/config';
import pool from '../src/config/db.js';

// ------------------------------
// 유틸 함수
// ------------------------------

// [min, max] 범위의 랜덤 정수
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 배열에서 하나 랜덤 선택
function randomChoice(arr) {
  if (!arr || arr.length === 0) {
    throw new Error('randomChoice에 빈 배열이 들어왔습니다.');
  }
  const idx = Math.floor(Math.random() * arr.length);
  return arr[idx];
}

// ------------------------------
// 카테고리별 이미지 URL 목록
//  - 하나짜리는 항상 그 이미지
//  - 두 개짜리는 상품마다 둘 중 하나 랜덤으로 선택
// ------------------------------
const CATEGORY_IMAGE_URLS = {
  // ----- TOP -----
  TSHIRT: [
    'https://images.unsplash.com/photo-1574180566232-aaad1b5b8450?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0',
    'https://images.unsplash.com/photo-1603924217873-6bab89f381de?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0'
  ],
  SHIRT: [
    'https://plus.unsplash.com/premium_photo-1683140435505-afb6f1738d11?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0',
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0'
  ],
  HOODIE: [
    'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?q=80&w=1544&auto=format&fit=crop&ixlib=rb-4.1.0'
  ],
  SWEAT: [
    'https://plus.unsplash.com/premium_photo-1661741379133-9206bca144dc?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0'
  ],
  KNIT: [
    'https://images.unsplash.com/photo-1641642231157-0849081598a2?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0'
  ],
  BLOUSE: [
    'https://plus.unsplash.com/premium_photo-1705554519869-fdcebc4ba94b?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0'
  ],
  DRESS: [
    'https://plus.unsplash.com/premium_photo-1675186049409-f9f8f60ebb5e?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0'
  ],

  // ----- BTM -----
  JEANS: [
    'https://images.unsplash.com/photo-1542272604-787c3835535d?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0'
  ],
  SLACKS: [
    'https://images.unsplash.com/photo-1584865288642-42078afe6942?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0'
  ],
  SHORTS: [
    'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0'
  ],
  SKIRT: [
    'https://images.unsplash.com/photo-1577900232427-18219b9166a0?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0'
  ],
  JOGGER: [
    'https://images.unsplash.com/photo-1552902875-9ac1f9fe0c07?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0'
  ],

  // ----- SHOES -----
  SNEAKERS: [
    'https://plus.unsplash.com/premium_photo-1682435561654-20d84cef00eb?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0'
  ],
  LOAFERS: [
    'https://images.unsplash.com/photo-1616406432452-07bc5938759d?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0'
  ],
  BOOTS: [
    'https://images.unsplash.com/photo-1605812860427-4024433a70fd?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0'
  ],
  HEELS: [
    'https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0'
  ],

  // ----- ACC -----
  CAP: [
    'https://plus.unsplash.com/premium_photo-1695604460161-cad706bb68fe?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0'
  ],
  BAG: [
    'https://images.unsplash.com/photo-1622560480654-d96214fdc887?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0',
    'https://plus.unsplash.com/premium_photo-1678739395192-bfdd13322d34?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0'
  ],
  BELT: [
    'https://images.unsplash.com/photo-1666723043169-22e29545675c?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0',
    'https://plus.unsplash.com/premium_photo-1724075829638-7a4d3f2eb235?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0'
  ],
  WALLET: [
    'https://images.unsplash.com/photo-1624538000860-24716b9050f2?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0',
    'https://images.unsplash.com/photo-1637486069202-b1163268c240?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0'
  ]
};

// 매핑 안 된 카테고리 있을 때 사용할 기본 이미지 (혹시 모를 대비)
const DEFAULT_IMAGE_URLS = [
  'https://images.unsplash.com/photo-1574180566232-aaad1b5b8450?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0'
];

// 카테고리 코드로 이미지 하나 선택
function pickImageUrlByCategory(categoryCode) {
  const upper = String(categoryCode || '').toUpperCase();
  const list = CATEGORY_IMAGE_URLS[upper] || DEFAULT_IMAGE_URLS;
  return randomChoice(list);
}

// 카테고리 코드에 따라 성별 자동 결정
// - DRESS / BLOUSE / SKIRT / HEELS → WOMEN 고정
// - 나머지 → MEN / WOMEN / UNISEX 섞어서 사용
function decideGenderCodeByCategory(categoryCode) {
  const upper = String(categoryCode || '').toUpperCase();
  const womenOnly = ['DRESS', 'BLOUSE', 'SKIRT', 'HEELS'];

  if (womenOnly.includes(upper)) {
    return 'WOMEN';
  }
  return randomChoice(['MEN', 'WOMEN', 'UNISEX']);
}

// ------------------------------
// 브랜드 시드 데이터
// ------------------------------
const BRAND_SEED = [
  { name: '무신사 스탠다드', code: 'MUSINSA_STD' },
  { name: '선웅이 옷가게', code: 'SUNWOONG_SHOP' },
  { name: 'Nike', code: 'NIKE' },
  { name: 'Adidas', code: 'ADIDAS' },
  { name: 'New Balance', code: 'NEW_BALANCE' },
  { name: 'Puma', code: 'PUMA' }
];

async function seedBrands(conn) {
  console.log('브랜드 기본 데이터 upsert 중...');

  for (const b of BRAND_SEED) {
    await conn.query(
      `
      INSERT INTO brands (name, code, logo_url)
      VALUES (?, ?, NULL)
      ON DUPLICATE KEY UPDATE
        code = VALUES(code)
      `,
      [b.name, b.code]
    );
  }
}

// ------------------------------
// 마스터 데이터 로딩
// ------------------------------
async function loadMasterData(conn) {
  const [genders] = await conn.query(`
    SELECT gender_id, code, name
    FROM genders
  `);

  const [categories] = await conn.query(`
    SELECT
      c.category_id,
      c.code AS category_code,
      c.name AS category_name,
      cg.code AS group_code,
      cg.name AS group_name
    FROM categories c
    JOIN category_groups cg ON c.group_id = cg.group_id
    ORDER BY cg.display_order, c.display_order
  `);

  const [brands] = await conn.query(`
    SELECT brand_id, name, code
    FROM brands
    ORDER BY brand_id
  `);

  if (genders.length === 0) {
    throw new Error('genders 테이블에 데이터가 없습니다. 먼저 genders를 INSERT 해 주세요.');
  }
  if (categories.length === 0) {
    throw new Error('categories 테이블에 데이터가 없습니다. 먼저 categories를 INSERT 해 주세요.');
  }
  if (brands.length === 0) {
    throw new Error('brands 테이블에 데이터가 없습니다. seedBrands가 제대로 실행되었는지 확인하세요.');
  }

  return { genders, categories, brands };
}

// 상품명 생성 예: "[Nike] 여성 원피스 3"
function buildProductName(brandName, genderName, categoryName, index) {
  return `[${brandName}] ${genderName} ${categoryName} ${index}`;
}

// 상품 설명 더미 텍스트
function buildProductDescription(groupName, categoryName) {
  return (
    `선웅이 옷가게의 ${groupName} 카테고리 ${categoryName} 기본 아이템입니다. ` +
    `데일리로 입기 좋은 베이직 디자인으로, 다양한 코디에 활용하기 좋습니다.`
  );
}

// ------------------------------
// 메인: 상품/이미지 시딩
// ------------------------------
async function seedProductsAndImages() {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 1) 브랜드 시드
    await seedBrands(conn);

    // 2) 마스터 데이터 로딩
    const { genders, categories, brands } = await loadMasterData(conn);
    console.log(
      `성별 ${genders.length}개, 카테고리 ${categories.length}개, 브랜드 ${brands.length}개 로딩 완료.`
    );

    const genderMap = new Map(genders.map(g => [g.code, g]));

    const TOTAL_TARGET_PRODUCTS = 150;
    const categoryCount = categories.length;
    const basePerCategory = Math.floor(TOTAL_TARGET_PRODUCTS / categoryCount);
    const remainder = TOTAL_TARGET_PRODUCTS % categoryCount;

    let totalProducts = 0;
    let totalImages = 0;

    // 각 카테고리마다 basePerCategory개씩 만들고,
    // 앞에서부터 remainder개 카테고리는 하나씩 더 만들어서 총 150개 맞춘다.
    for (let catIndex = 0; catIndex < categories.length; catIndex++) {
      const cat = categories[catIndex];
      const {
        category_id,
        category_code,
        category_name,
        group_code,
        group_name
      } = cat;

      const productCountForThisCategory =
        basePerCategory + (catIndex < remainder ? 1 : 0);

      console.log(
        `카테고리 처리: [${group_code}] ${category_code} / ${category_name} → ${productCountForThisCategory}개 생성 예정`
      );

      for (let i = 1; i <= productCountForThisCategory; i++) {
        // 2-1) 성별 결정
        const genderCode = decideGenderCodeByCategory(category_code);
        const gender = genderMap.get(genderCode);
        if (!gender) {
          throw new Error(`genders 테이블에 ${genderCode} 코드가 없습니다.`);
        }

        // 2-2) 랜덤 브랜드 선택
        const brand = randomChoice(brands);

        // 2-3) 가격 / 할인 / 재고 랜덤
        const price = randomInt(19000, 199000); // 1.9만 ~ 19.9만
        const discountOptions = [0, 5, 10, 15, 20];
        const discountPercentage = randomChoice(discountOptions);
        const stock = randomInt(10, 100);

        // 2-4) 카테고리 기준 이미지 선택
        const imageUrl = pickImageUrlByCategory(category_code);

        // 2-5) 이름/설명 생성
        const productName = buildProductName(
          brand.name,
          gender.name,
          category_name,
          i
        );
        const productDescription = buildProductDescription(
          group_name,
          category_name
        );

        // 2-6) products INSERT
        const [productResult] = await conn.query(
          `
          INSERT INTO products
            (external_id, gender_id, category_id, brand_id,
             name, description, price_krw, discount_percentage,
             stock, thumbnail_url, view_count)
          VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            null,                 // external_id (외부 API 안 씀)
            gender.gender_id,     // gender_id
            category_id,          // category_id
            brand.brand_id,       // brand_id
            productName,          // name
            productDescription,   // description
            price,                // price_krw
            discountPercentage,   // discount_percentage
            stock,                // stock
            imageUrl,             // thumbnail_url
            0                     // view_count
          ]
        );

        const productId = productResult.insertId;
        totalProducts += 1;

        // 2-7) product_images INSERT
        //  - 여기서는 카테고리에서 고른 이미지 1장만 등록하고, 썸네일로도 사용
        await conn.query(
          `
          INSERT INTO product_images
            (product_id, image_url, display_order, is_thumbnail)
          VALUES
            (?, ?, ?, ?)
          `,
          [productId, imageUrl, 1, 1]
        );
        totalImages += 1;

        console.log(
          `상품 생성: product_id=${productId}, category=${category_code}, gender=${genderCode}, brand=${brand.name}`
        );
      }
    }

    await conn.commit();
    console.log(`상품 ${totalProducts}개, 이미지 ${totalImages}개 생성 완료.`);
  } catch (err) {
    await conn.rollback();
    console.error('시딩 중 오류 발생:', err);
  } finally {
    conn.release();
    await pool.end();
    console.log('DB 커넥션 풀 종료.');
  }
}

// ------------------------------
// 실행 엔트리
// ------------------------------
(async () => {
  console.log('선웅이 옷가게 더미 상품/이미지 시딩을 시작합니다.');
  await seedProductsAndImages();
})();
