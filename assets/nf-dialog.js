
document.addEventListener('DOMContentLoaded', function () {
  const drawer = document.querySelector('#nf_drawer');
  document.body.addEventListener('click', (event) => {
    const closeDrawerButton = event.target.closest('.nf-close-dialog');
    if (closeDrawerButton) {
      drawer.removeAttribute('open');
    }
  });
  document.body.addEventListener('click', (event) => {
    const openDrawerButton = event.target.closest('.nf_show_dialog');
    if (openDrawerButton) {
      drawer.setAttribute('open', '');
    }
  });
  document.querySelector('.nf-drawer').addEventListener('click', (event) => {
    if (event.target === document.querySelector('.nf-drawer')) {
      drawer.removeAttribute('open');
    }
  });
  const tabs = document.querySelectorAll('.tab');
  const contentPanels = document.querySelectorAll('.tab-content');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-target');
      tabs.forEach((t) => t.classList.remove('active'));
      contentPanels.forEach((p) => p.classList.remove('active'));
      tab.classList.add('active');
      document.querySelector(`#${target}`).classList.add('active');
    });
  });

  var dropdown = document.querySelector('.nf-dropdown');
  var content = document.querySelector('.nf-dropdown-content');
  var caret = document.querySelector('.nf-dropdown-caret');

  dropdown.addEventListener('click', function (event) {
    event.stopPropagation();
    content.classList.toggle('active');
    caret.classList.toggle('active');
  });

  document.addEventListener('click', function (event) {
    if (content.classList.contains('active')) {
      content.classList.remove('active');
      caret.classList.remove('active');
    }
  });

});


class NFCustomerOrders extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.state = {
      orders: [],
      lineItems: [],
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
    const quantityInput = button.closest('.quantity-spinner').querySelector('.quantity__input');
    let quantity = parseInt(quantityInput.value);
    if (increment) {
      quantity++;
    } else {
      quantity = quantity > 0 ? quantity - 1 : 0;
    }
    quantityInput.value = quantity;
    this.checkAndToggleATCButton();
  }
  addToCart() {
    const addToCartButton = this.shadowRoot.querySelector('.add-to-cart-button');
    const orderQuantitySpinners = this.shadowRoot.querySelectorAll('.order-qty-spinner');
    let orderListData = [];
    addToCartButton.innerHTML = `<div class="loading-overlay__spinner">
    <svg
      aria-hidden="true"
      focusable="false"
      role="presentation"
      class="spinner"
      viewBox="0 0 66 66"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle class="path" fill="none" stroke-width="6" cx="33" cy="33" r="30"></circle>
    </svg>
  </div>`;

    orderQuantitySpinners.forEach(orderQuantitySpinner => {
      const orderQuantityInput = orderQuantitySpinner.querySelector('.quantity__input');
      let variantId = orderQuantitySpinner.closest('.wishlist_row').getAttribute('data-variant-id');
      let quantity = parseInt(orderQuantityInput.value);
      if (quantity > 0) {
        orderListData.push({ id: variantId, quantity: quantity });
      }
    });
    if (orderListData.length > 0) {
      const data = { items: orderListData };
      fetch('/cart/add.js', {
        body: JSON.stringify(data),
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'xmlhttprequest'
        },
        method: 'POST'
      })
        .then(response => response.json())
        .then(json => {
          console.log('Items added:', json);
          addToCartButton.innerHTML = window.String.reOrderSelectedItems;
          var x = document.getElementById('account-drawer-notif');
          x.className = 'show';
          setTimeout(function () {
            x.className = x.className.replace('show', '');
          }, 3000);
        })
        .catch(error => {
          console.error('Error adding items to cart:', error);
        });
    } else {
      console.log("No items to add to cart");
    }
    this.checkAndToggleATCButton();
  }
  checkAndToggleATCButton() {
    const addToCartButton = this.shadowRoot.querySelector('.add-to-cart-button');
    if (addToCartButton) {
      const orderQuantitySpinners = this.shadowRoot.querySelectorAll('.order-qty-spinner');
      const allZero = Array.from(orderQuantitySpinners).every(spinner => {
        const quantity = parseInt(spinner.querySelector('.quantity__input').value);
        return quantity <= 0;
      });
      const wishlistRows = this.shadowRoot.querySelectorAll('.wishlist_row');
      const anyUnavailable = Array.from(wishlistRows).every(row => {
        return row.getAttribute('data-available') === false;
      });
      addToCartButton.disabled = anyUnavailable;
      addToCartButton.classList.toggle('disabled', anyUnavailable);
      if (allZero) {
        addToCartButton.disabled = true;
        addToCartButton.classList.add('disabled');
      } else {
        addToCartButton.disabled = false;
        addToCartButton.classList.remove('disabled');
      }
    }
  }

  updateCartButtonUI(message) {
    const cartButton = this.shadowRoot.querySelector('.re-order-btn');
    if (cartButton) {
      cartButton.innerHTML = message;
      setTimeout(() => {
        cartButton.innerHTML = `Add Selected Items to Cart`;
      }, 3000);
    }
  }

  async fetchOrderLineItems(orderId) {
    await window.refreshTokenIfNeeded();
    const { url, authToken } = window.customerOrdersApp;
    const headers = new Headers({
      'Authorization': `Bearer ${authToken}`
    });
    const requestOptions = {
      method: 'GET',
      headers
    };

    fetch(`${window.customerOrdersApp.urlProxy}api/v1/order/line-items?order_id=${orderId}`, requestOptions)
      .then(response => response.json())
      .then(data => {
        console.log(data.data);
        this.setState({ lineItems: data.data, view: 'lineItems', isLoading: false });
      })
      .catch(error => {
        console.error('Error:', error);
        this.setState({ error });
      });
  }
  onOrderIdClick(event) {
    event.preventDefault();
    const orderId = event.currentTarget.getAttribute('data-order-id');
    if (orderId) {
      history.pushState({ orderId }, '', `?orderId=${orderId}`);
      this.setState({ isLoading: true });
      this.fetchOrderLineItems(orderId);
    }
  }

  attachEventListeners() {
    this.shadowRoot.addEventListener('click', (event) => {
      if (event.target.matches('.minus__button')) {
        this.updateQuantity(event.target, false);
      } else if (event.target.matches('.plus__button')) {
        this.updateQuantity(event.target, true);
      } else if (event.target.matches('.add-to-cart-button')) {
        this.addToCart();
      }
    });
  }

  attachPaginationEventListeners() {
    const prevButton = this.shadowRoot.querySelector('#prevPage');
    const nextButton = this.shadowRoot.querySelector('#nextPage');

    prevButton?.addEventListener('click', () => {
      this.fetchOrders(`previous=${this.state.previousPage}`);
    });

    nextButton?.addEventListener('click', () => {
      this.fetchOrders(`next=${this.state.nextPage}`);
    });
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.render();
  }


  render() {
    let content;

    if (this.state.isLoading) {
      content = '<p>Loading...</p>';
    } else if (this.state.error) {
      content = `<p>Error: ${this.state.error.message}</p>`;
    } else if (this.state.view === 'lineItems') {
      this.checkAndToggleATCButton();
      const urlParams = new URLSearchParams(window.location.search);
      const currentOrderId = urlParams.get('orderId');
      let currentOrders = this.state.orders.find(order => order.id == currentOrderId) || {};
      content = `
        <span class="nf-return-button" id="backButton">${window.backButton}</span>
        <div id="nf-order-view">
          <div class="nf-section nf-my-orders__wrapper">
            <div class="nf-section nf-my-orders__wrapper nf-view-orders">
              <div class="nf-section-heading">
                <div>
                  <h1 class="nf-order-name" style="display:inline;">${currentOrders.name}</h1>
                  <div class="order__status-info">
                    <p>${window.String.customerOrderDate} ${currentOrders.liquidShopifyCreatedAt.toLowerCase()}</p>
                    ${currentOrders.cancelledAt ? (
          currentOrders.cancelledAt
        ) : ("")}
                  </div>
                  <div class="order-details-track-and-trace" style="{{ tracking_url_display }}">
                    <p>
                      ${currentOrders.fulfillments.edges[0] ? `${window.icon_truck_solid}
                      <a class="tracking-link" target="_blank" href="${currentOrders.fulfillments.edges[0].node.trackingUrls[0]}">
                        ${window.String.customerTrack_and_trace}
                      </a>` : ``}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div class="nf-my-orders__table recently_ordered">
              <div class="account-product__grid">
              ${this.renderLineItems()}
              </div>
              <div class="re-order-cta-btn--wrapper">
                <button
                  class="re-order-cta re-order-btn add-to-cart-button"
                >
                ${window.String.reOrderSelectedItems}
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      content = `
        <table class="nf-my-orders__table">
          <thead>
            <tr>
            <th>${window.String.customerOrder}</th>
            <th>${window.String.customerTrack_and_trace}</th>
            <th colspan="2">${window.String.customerDate}</th>
            <th>${window.String.customerTotal}</th>
            </tr>
          </thead>
          <tbody>
            ${this.renderOrders()}
          </tbody>
        </table>
        ${this.renderPagination()}
      `;
    }

    this.shadowRoot.innerHTML = `
      ${content}
    `;
    this.shadowRoot.querySelectorAll('.order_item').forEach(element => {
      element.addEventListener('click', this.onOrderIdClick.bind(this));
    });
    if (this.state.view === 'orders') {
      // this.shadowRoot.querySelectorAll('.order_item').forEach(element => {
      //   element.addEventListener('click', this.onOrderIdClick.bind(this));
      // });
    } else {
      this.shadowRoot.querySelector('#backButton').addEventListener('click', this.onBackClick.bind(this));
    }
    this.attachPaginationEventListeners();
    const styleLink = document.createElement('link');
    styleLink.rel = 'stylesheet';
    styleLink.href = window.Shopify.theme.stylesheetUrl;
    this.shadowRoot.append(styleLink);

    const styleLinkLoader = document.createElement('link');
    styleLinkLoader.rel = 'stylesheet';
    styleLinkLoader.href = window.Shopify.theme.loading;
    this.shadowRoot.append(styleLinkLoader);

  }
}
customElements.define('nf-customer-orders', NFCustomerOrders);
