
import {
  getHomeData,
  listProducts,
  getProductDetail
} from '../services/product.service.js';
import { findFavorite } from '../models/wishlist.model.js'; 
// 그룹 코드 → 한글 이름 매핑용 (뷰 타이틀 표시용)
const GROUP_LABELS = {
  TOP: '상의',
  BTM: '하의',
  SHOES: '신발',
  ACC: '악세서리'
};

// 홈 화면
export async function renderHome(req, res, next) {
  try {
    const { best, newest } = await getHomeData();
    res.render('products/home', {
      title: '선웅이 옷가게',
      bestProducts: best,
      newProducts: newest
    });
  } catch (err) {
    next(err);
  }
}

// 상품 목록 (/products?group=TOP&keyword=후드&page=2)
export async function showProductList(req, res, next) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = 20;
    const groupCode = req.query.group || null; // TOP / BTM / SHOES / ACC
    const keyword = req.query.keyword || '';

    const { products, total } = await listProducts({
      page,
      limit,
      groupCode,
      keyword: keyword.trim() || null
    });

    const totalPage = Math.ceil(total / limit);
    const groupLabel = groupCode ? GROUP_LABELS[groupCode] || '' : '전체';

    res.render('products/list', {
      title: groupCode ? `${groupLabel} 상품` : '전체 상품',
      products,
      page,
      totalPage,
      groupCode,
      groupLabel,
      keyword
    });
  } catch (err) {
    next(err);
  }
}

// 상품 상세 (/products/:id)
export async function showProductDetail(req, res, next) {
  try {
    const { id } = req.params;
    const product = await getProductDetail(id);

       let isFavorite = false;
    if (req.session.user) {
      const favorite = await findFavorite(req.session.user.user_id, id);
      isFavorite = !!favorite;
    }

    res.render('products/detail', {
      title: product.name,
      product,
      isFavorite 
    });
  } catch (err) {
    next(err);
  }
}
