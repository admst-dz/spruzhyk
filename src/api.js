const BASE = '/api';

const req = async (method, path, body) => {
    const res = await fetch(`${BASE}${path}`, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : {},
        body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 204) return null;
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'API error');
    return data;
};

// ─── Users ────────────────────────────────────────────────────────────────────

export const getUserRole = async (uid) => {
    try {
        const user = await req('GET', `/users/${uid}`);
        return { role: user.role || 'client', subRole: user.sub_role || null };
    } catch {
        return { role: null, subRole: null };
    }
};

export const checkUserExists = async (uid) => {
    try {
        const user = await req('GET', `/users/${uid}`);
        return { exists: true, role: user.role || 'client', data: { subRole: user.sub_role } };
    } catch {
        return { exists: false };
    }
};

export const createUserProfile = async (user, role, subRole = null) => {
    if (!user) return;
    return req('POST', '/users/', {
        id: user.uid,
        email: user.email,
        display_name: user.displayName || user.email?.split('@')[0] || '',
        role,
        sub_role: subRole,
    });
};

// ─── Orders ──────────────────────────────────────────────────────────────────

export const createOrderInDB = async (orderData) => {
    const res = await req('POST', '/orders/', orderData);
    return res.id;
};

export const fetchUserOrders = async (uid, email) => {
    const params = email ? `?email=${encodeURIComponent(email)}` : '';
    const orders = await req('GET', `/orders/user/${uid}${params}`);
    return orders.map(toRow);
};

export const fetchAllOrders = async () => {
    const orders = await req('GET', '/orders/');
    return orders.map(toRow);
};

export const updateOrderStatus = async (orderId, status) => {
    return req('PATCH', `/orders/${orderId}/status`, { status });
};

export const claimGuestOrders = async (uid, email) => {
    if (!email) return;
    return req('POST', '/orders/claim', { uid, email });
};

const toRow = (o) => ({
    id: o.id,
    userId: o.user_id,
    userEmail: o.user_email,
    product: o.product_name,
    design: o.configuration?.productConfig
        ? `${o.configuration.productConfig.format || ''} / ${o.configuration.productConfig.bindingType || ''}`.trim().replace(/^\/\s*/, '')
        : '',
    price: o.total_price ?? 0,
    currency: o.currency,
    status: o.status,
    role: o.configuration?.clientType || '',
    isGuest: o.is_guest,
    configuration: o.configuration,
    date: o.created_at ? new Date(o.created_at).toLocaleDateString('ru-RU') : 'Только что',
});

// ─── Products ────────────────────────────────────────────────────────────────

export const fetchAllProducts = async () => {
    const products = await req('GET', '/products/');
    return products.map(fromApiProduct);
};

export const fetchDealerProducts = async (dealerId) => {
    const products = await req('GET', `/products/?dealer_id=${dealerId}`);
    return products.map(fromApiProduct);
};

export const saveProduct = async (data) => {
    const res = await req('POST', '/products/', toApiProduct(data));
    return res.id;
};

export const updateProduct = async (productId, data) => {
    return req('PUT', `/products/${productId}`, toApiProduct(data));
};

export const deleteProduct = async (productId) => {
    return req('DELETE', `/products/${productId}`);
};

const toApiProduct = (d) => ({
    dealer_id: d.dealerId || null,
    name: d.name,
    binding: d.binding || [],
    spiral_colors: d.spiralColors || [],
    has_elastic: d.hasElastic || false,
    elastic_colors: d.elasticColors || [],
    formats: d.formats || [],
    cover_colors: d.coverColors || [],
    retail_price: d.retailPrice ? Number(d.retailPrice) : null,
    wholesale_tiers: d.wholesaleTiers || [],
    image_url: d.imageUrl || null,
});

const fromApiProduct = (p) => ({
    id: p.id,
    dealerId: p.dealer_id,
    name: p.name,
    binding: p.binding || [],
    spiralColors: p.spiral_colors || [],
    hasElastic: p.has_elastic || false,
    elasticColors: p.elastic_colors || [],
    formats: p.formats || [],
    coverColors: p.cover_colors || [],
    retailPrice: p.retail_price,
    wholesaleTiers: p.wholesale_tiers || [],
    imageUrl: p.image_url,
});
