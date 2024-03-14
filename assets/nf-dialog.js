class NFCustomerOrders extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.state = {
      orders: [],
      lineItems: [], // Set lineItems to an empty array by default
      view: 'orders',
      isLoading: false,
      error: null,
      itemsPerPage: 10,
      nextPage: null,
      previousPage: null
    };
    this.onOrderIdClick = this.onOrderIdClick.bind(this);
    this.attachEventListeners();
  }

  connectedCallback() {
    if (document.readyState === 'complete') {
      this.initComponent();
    } else {
      window.addEventListener('load', () => this.initComponent());
    }
  }

  initComponent() {
    this.render();
    this.fetchOrders();
    this.checkAndToggleATCButton();
  }

  async fetchOrders(queryParams) {
    await window.refreshTokenIfNeeded();
    const { url, authToken } = window.customerOrdersApp;
    const headers = new Headers({
      'Authorization': `Bearer ${authToken}`
    });
    const requestOptions = {
      method: 'GET',
      headers,
      redirect: 'follow'
    };

    this.setState({ isLoading: true });

    fetch(`${window.customerOrdersApp.urlProxy}api/v1/customer/orders?items=${this.state.itemsPerPage}${queryParams ? `&${queryParams}` : ``}`, requestOptions)
      .then(response => response.json())
      .then(data => {
        this.setState({
          orders: data?.data,
          isLoading: false,
          nextPage: data.pagination?.next,
          previousPage: data.pagination?.previous
        });
      })
      .catch(error => {
        this.setState({ error, isLoading: false });
      });
  }

  renderPagination() {
    if (this.state.lineItems.length === 0) return ''; // Don't render pagination if lineItems array is empty
    return `
      <div class="pagination">
        <button id="prevPage" ${this.state.previousPage == null ? 'disabled' : ''}>${window.pageIcon}</button>
        <button id="nextPage" ${this.state.nextPage == null ? 'disabled' : ''}>${window.pageIcon}</button>
      </div>
    `;
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.render();
  }

  onBackClick(event) {
    event.preventDefault();
    this.setState({ view: 'orders', lineItems: [] });
    history.pushState({}, '', window.location.pathname);
  }

  renderOrders() {
    return this.state.orders.map(order => `
    <tr
    class="order_item" data-order-id="${order.id}"
    >
      <td
      class="nf-view_all"
      >
        <a href="javascript:void(0);" class="order_id">${order.name}</a>
      </td>
      <td >
        ${order.fulfillments.edges[0] ? `${window.icon_truck_solid}
        <a class="tracking-link" target="_blank" href="${order.fulfillments.edges[0].node.trackingUrls[0]}">
          ${window.String.customerTrack_and_trace}
        </a>` : ``}
      </td>
      <td colspan="2">${order.liquidShopifyCreatedAt}</td>
      <td>&euro;${order.totalPrice.replace(".", ",")}</td>
    </tr>
    `).join('');
  }

  renderLineItems() {
    return this.state.lineItems.map(item => {
      const productId = item.id ? item.id : '';
      const variantId = item.variant ? item.variant.id : '';
      const productTitle = item.product && item.product.title ? item.product.title : '';
      const inventoryQuantity = item.variant?.inventoryQuantity ? item.variant.inventoryQuantity : '';
      const productUrl = item.product && item.product?.onlineStoreUrl ? item.product.onlineStoreUrl : '';
      const imageUrl = item.product && item.product?.featuredImage && item.product.featuredImage.url ? item.product.featuredImage.url + '&width=100&height=100' : '';
      const productPrice = item.price ? item.price : '';
      const minusButton = this.shadowRoot.querySelectorAll('.minus__button');
      const plusButton = this.shadowRoot.querySelectorAll('.plus__button');
      const addToCartButton = this.shadowRoot.querySelectorAll('.add-to-cart-button');
      const isAvailable = inventoryQuantity >= 0;
      minusButton.forEach(button => {
        button.addEventListener('click', () => {
          this.updateQuantity(button, false);
          console.log('minus');
        });
      });
      plusButton.forEach(button => {
        button.addEventListener('click', () => {
          this.updateQuantity(button, true);
          console.log('plusButton');
        });
      });

      addToCartButton.forEach(button => {
        button.addEventListener('click', () => {
          const quantityInput = button.closest('.quantity-spinner').querySelector('.quantity__input');
          const quantity = parseInt(quantityInput.value);
          this.addToCart(variantId, quantity);
        });
      });
      return `
      ${item ? `<div class="wishlist_row" data-variant-id="${variantId}" data-available="${isAvailable}">
      <div class="product-image-box">
        <a href="${productUrl}" class="no-decor">
          ${imageUrl ? `<div class="image-box">
          <div class="image_wrapper">
            <img style="width: 100px" src="${imageUrl}">
          </div>
        </div>` : ""}        
        </a>
      </div>
      <div class="desc-box">
        <div>
          <a href="${productUrl}">
            <p class="product_title">${productTitle}</p>
          </a>
        </div>
        <div class="price-box">
          ${isAvailable ? `<p class="price">&euro;${productPrice.replace(".", ",")}</p>` : `<div class="account-outofstock">UITVERKOCHT</div>`}
        </div>
        <div class="inventory-box">
          <div class="volume_stocks align-items-center">
            ${item.product?.metafieldOtherPiecesPerBox ? `<div class="account-content">
                <span><!-- Icon here if needed --></span>
                ${item.product?.metafieldOtherPiecesPerBox ?? ""} pieces per box
              </div>` : ''
        }
            ${isAvailable && item.variant?.sku ? `&nbsp; | &nbsp;<div class="sku">SKU: ${item.variant.sku}</div>` : ''}
          </div>
      
        </div>
        ${isAvailable ? `<div class="quantity-spinner order-qty-spinner">
            <button
              class="minus__button order-minus-btn"
              type="button"
            >
              -
            </button>
            <input
              class="quantity__input order-quantity-input"
              type="number"
              value="${item.quantity}"
              min="0"
            >
            <button
              class="plus__button order-plus-btn"
              type="button"
            >
              +
            </button>
          </div>` : ''
        }
      </div>
    </div>` : ``}
    `}).join('');
  }

  updateQuantity(button, increment) {
    const quantityInput = button.closest('.
