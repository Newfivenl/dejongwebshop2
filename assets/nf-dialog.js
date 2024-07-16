document.addEventListener('DOMContentLoaded', function () {
  function hideOrderTabs() {
    const targets = ["wishlist", "top-ordered__tab"];
    targets.forEach(target => {
      const tabs = document.querySelectorAll(`[data-target="${target}"]`);
      tabs.forEach(tab => {
        tab.style.display = 'none';
      });
    });
  }
  // Customer Tag Checker
  if (!window.String.customerTags?.includes(window.String.COA_ROLE_ADMIN) && localStorage.getItem('currentAccount')) {
    localStorage.removeItem('currentAccount');
    window.location.reload();
    return;
  }

  const drawer = document.querySelector('#nf_drawer');
  const logoutBtn = document.querySelector('.logout_btn') || null;
  const customerSearchInput = document.getElementById('customerSearchInput');
  const customerSearchDropdown = document.getElementById('customerSearchDropdown');
  let customers = [];

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

  var dropdown = document.querySelector('.nf-dropdown') || null;
  var content = document.querySelector('.nf-dropdown-content')  || null;
  var caret = document.querySelector('.nf-dropdown-caret')  || null;

  if (dropdown) {
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
  }

  const queryParams = new URLSearchParams(window.location.search);
  const accountNumber = queryParams.get('accountnumber');
  if (accountNumber) {
    drawer.setAttribute('open', '');
  }

  // Super user settings with sample data 
  const switchAccountBtn = document.getElementById('switchAccountBtn') || null;
  const accountModal = document.getElementById('accountModal') || null;
  const cancelBtn = document.getElementById('cancelBtn') || null;
  const confirmBtn = document.getElementById('confirmBtn') || null;
  const ordersComponent = document.querySelector('nf-customer-orders') || null;
  const selectedAccountDisplay = document.getElementById('selectedAccountDisplay') || null;
  const revertBtn = document.getElementById('revertBtn') || null;
  const customerProfileName = document.getElementById('customerProfileName') || null;
  let currentAccount = localStorage.getItem('currentAccount') || null;
  let previousAccount = null;

  let currentAccountData = JSON.parse(localStorage.getItem('currentAccount')) ?? '';
  if (currentAccountData) {
    currentAccount = currentAccountData.customerID;
    // loadAccountData(currentAccountData.email);
    const displayName = (currentAccountData.firstName && currentAccountData.lastName) ?
      `${currentAccountData.firstName} ${currentAccountData.lastName}` :
      currentAccountData.email;
    updateSelectedAccountDisplay(displayName);
    // toggleDraftOrderButton();
    customerProfileName.innerHTML = `<div class="customer__wrapper"><span class="customer__badge">Customer</span><span>
    ${currentAccountData.company ? `${currentAccountData.company},` : ``} 
    ${currentAccountData.city ? `${currentAccountData.city},` : ``} 
    ${currentAccountData.firstName ? `${currentAccountData.firstName}` : ``} 
    ${currentAccountData.lastName ? `${currentAccountData.lastName},` : ``} 
    ${currentAccountData.address1 ? `${currentAccountData.address1},` : ``}   
    ${currentAccountData.email ? `${currentAccountData.email}`  : ``} </span></div>`;
    if (revertBtn) {
      revertBtn.style.display = 'inline-block';
    }
    // hideOrderTabs();
  } else {
    if (revertBtn) {
      revertBtn.style.display = 'none';
    }
  }
  cancelBtn.addEventListener('click', () => {
    accountModal.close();
  });
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('currentAccount');
      window.location.reload();
    });
  }
  if (switchAccountBtn) {
    switchAccountBtn.addEventListener('click', () => {
      accountModal.showModal();
      customerProfileName.innerHTML = `<div class="customer__wrapper"><span class="customer__badge">Customer</span><span>${customerSearchInput.value} </span></div>`;
  
      fetchCustomerList();
  
    });
  }
  if (revertBtn) {
    revertBtn.addEventListener('click', () => {
      localStorage.removeItem('currentAccount');
      revertBtn.style.display = 'none';
      window.location.reload();
      console.log('rever button clicked');
    });
  }
  confirmBtn.addEventListener('click', () => {
    const selectedAccountName = customerSearchInput.value;
    const selectedAccountId = customerSearchInput.dataset.value;
    console.log('Selected Account ID:', selectedAccountId);
    console.log('Customers array:', customers);

    // Log each customer ID to compare
    customers.forEach((customer, index) => {
      console.log(`Customer ${index} ID:`, customer.id);
      console.log(`Does ${customer.id} equal ${selectedAccountId}?`, customer.id == selectedAccountId);
    });

    const selectedCustomer = customers.find(customer => customer.id == selectedAccountId);
    console.log('Selected customer:', selectedCustomer);

    if (!selectedCustomer) {
      console.error('Selected customer not found');
      return;
    }

    if (currentAccount !== selectedAccountId) {
      previousAccount = currentAccount;
      currentAccount = selectedAccountId;

      const accountData = {
        email: selectedCustomer.email,
        firstName: selectedCustomer.first_name,
        lastName: selectedCustomer.last_name,
        customerID: selectedCustomer.id,
        address1: selectedCustomer.default_address?.address1 ?? "",
        city: selectedCustomer.default_address?.city ?? "",
        address2: selectedCustomer.default_address?.address2 ?? "",
        company: selectedCustomer.default_address?.company ?? ""
      };

      localStorage.setItem('currentAccount', JSON.stringify(accountData));
      let accountDisplayName = JSON.parse(localStorage.getItem('currentAccount'));
      const displayAccountName = (accountDisplayName.firstName && accountDisplayName.lastName) ?
        `${accountDisplayName.firstName} ${accountDisplayName.lastName}` :
        accountDisplayName.email;
      updateSelectedAccountDisplay(displayAccountName);
      loadAccountData(selectedAccountName);
      customerProfileName.innerHTML = `<div class="customer__wrapper"><span class="customer__badge">Customer</span><span>
      ${accountDisplayName.company ? `${accountDisplayName.company},` : ``} 
      ${accountDisplayName.city ? `${accountDisplayName.city}, ` : ``} 
      ${accountDisplayName.firstName ? `${accountDisplayName.firstName} ` : ``} 
      ${accountDisplayName.lastName ? `${accountDisplayName.lastName}, ` : ``} 
      ${accountDisplayName.address1 ? `${accountDisplayName.address1}, ` : ``} 
      ${accountDisplayName.email ? `${accountDisplayName.email}`  : ``}  
      </span></div>`;

     
      revertBtn.style.display = 'inline-block';
      accountModal.close();
      ordersComponent.setState({ view: 'orders' });
      ordersComponent.fetchProductOrderList();
    }
  });

  function updateSelectedAccountDisplay(accountName) {
    selectedAccountDisplay.innerHTML = `<span class="customer__badge">Customer</span> <span class="account__name">${accountName}</span>`;
  }

  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  const debouncedFetchCustomerList = debounce(fetchCustomerList, 300);

  async function fetchCustomerList(query = '') {
    await window.refreshTokenIfNeeded();
    const { url, authToken } = window.customerOrdersApp;
    const headers = new Headers({
      'Authorization': `Bearer ${authToken}`
    });
    const requestOptions = {
      method: 'GET',
      headers
    };
    fetch(`${window.customerOrdersApp.urlProxy}api/v1/customer/list?items=25&sort=desc&search=${encodeURIComponent(query)}`, requestOptions)
      .then(response => response.json())
      .then(data => {
        customers = data.data;
        populateCustomerList(customers);
      })
      .catch(error => console.error('Error fetching customer list:', error));
  }

  function populateCustomerList(data) {
    customerSearchDropdown.innerHTML = '';
    data.forEach(customer => {
      const li = document.createElement('li');
      let liTextContent = [];
      if (customer?.default_address?.company) {
        liTextContent.push(customer.default_address.company);
      }
    if (customer?.default_address?.city) { // New line to include city
      liTextContent.push(customer.default_address.city); // New line to include city
    }
      
    if (customer?.first_name && customer?.last_name) {
        liTextContent.push(`${customer.first_name} ${customer.last_name}`);
      }

      if (customer?.email) {
        liTextContent.push(customer.email);
      }
      li.textContent = liTextContent.join(', ').trim();
      li.dataset.value = customer.id;

      customerSearchDropdown.appendChild(li);
    });
  }

  customerSearchInput.addEventListener('input', function () {
    const query = this.value;
    if (query.length > 0) {
      debouncedFetchCustomerList(query);
      customerSearchDropdown.style.display = 'block';
    } else {
      customerSearchDropdown.style.display = 'none';
    }
  });

  customerSearchDropdown.addEventListener('click', function (event) {
    const selectedCustomer = event.target;
    // console.log('Selected customer from dropdown:', selectedCustomer);
    customerSearchInput.value = selectedCustomer.textContent;
    customerSearchInput.dataset.company = selectedCustomer.dataset.company;
    customerSearchInput.dataset.value = selectedCustomer.dataset.value;
    // console.log('Customer search input dataset:', customerSearchInput.dataset);
    customerSearchDropdown.style.display = 'none';
  });

  async function loadAccountData(accountId) {
    ordersComponent.fetchOrders(`email=${encodeURIComponent(accountId)}`);
  }

  // function toggleDraftOrderButton() {
  //   const createDraftOrderButton = document.querySelector('.create-draft-order-button') ?? '';
  //   if (currentAccount) {
  //     createDraftOrderButton.style.display = 'flex'; 
  //     createDraftOrderButton.innerHTML = `
  //       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M441 58.9L453.1 71c9.4 9.4 9.4 24.6 0 33.9L424 134.1 377.9 88 407 58.9c9.4-9.4 24.6-9.4 33.9 0zM209.8 256.2L344 121.9 390.1 168 255.8 302.2c-2.9 2.9-6.5 5-10.4 6.1l-58.5 16.7 16.7-58.5c1.1-3.9 3.2-7.5 6.1-10.4zM373.1 25L175.8 222.2c-8.7 8.7-15 19.4-18.3 31.1l-28.6 100c-2.4 8.4-.1 17.4 6.1 23.6s15.2 8.5 23.6 6.1l100-28.6c11.8-3.4 22.5-9.7 31.1-18.3L487 138.9c28.1-28.1 28.1-73.7 0-101.8L474.9 25C446.8-3.1 401.2-3.1 373.1 25zM88 64C39.4 64 0 103.4 0 152V424c0 48.6 39.4 88 88 88H360c48.6 0 88-39.4 88-88V312c0-13.3-10.7-24-24-24s-24 10.7-24 24V424c0 22.1-17.9 40-40 40H88c-22.1 0-40-17.9-40-40V152c0-22.1 17.9-40 40-40H200c13.3 0 24-10.7 24-24s-10.7-24-24-24H88z"/></svg>
  //       Create Draft Order
  //     `;
  //     createDraftOrderButton.style.backgroundColor = '#fbe04c';
  //   }
  // }
  // toggleDraftOrderButton();


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
  // Superuser settings
  setOrders(orders) {
    this.state.orders = orders;
    this.render();
  }
const fetchProductOrderList = async () => {
  // Show loading spinner
  const productListContainer = document.getElementById("product__list");
  productListContainer.innerHTML = `<div class="spinner"></div>`;

  try {
    await window.refreshTokenIfNeeded();
    const currentAccountData = JSON.parse(localStorage.getItem('currentAccount'));
    const { authToken } = window.customerOrdersApp;
    const email = encodeURIComponent(currentAccountData?.email ?? window.String.customerEmail);
    const url = `${window.customerOrdersApp.urlProxy}api/v1/liquid/product-list?email=${email}`;
    const token = 'Bearer ' + authToken;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'text/html'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.text();
    productListContainer.innerHTML = data;

    const event = new CustomEvent('productListUpdated');
    const dragEvent = new CustomEvent('draggableEvent');
    document.dispatchEvent(event);
    document.dispatchEvent(dragEvent);

  } catch (error) {
    console.error('Failed to fetch products:', error);
    productListContainer.innerHTML = `<p>Error loading products. Please try again later.</p>`;
  }
};


  initComponent() {
    this.render();
    const currentAccountData = JSON.parse(localStorage.getItem('currentAccount'));
    if (currentAccountData && currentAccountData.email) {
      this.fetchOrders(`email=${encodeURIComponent(currentAccountData.email)}`);
    } else {
      this.fetchOrders();
    }
    this.checkAndToggleATCButton();
    this.fetchProductOrderList();

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
    // console.log('render orders', this.state.orders);
    return this.state.orders.map(order => `
    <tr
    class="order_item" data-order-id="${order.id}"
    >
      <td
      class="nf-view_all"
      >
        <a href="javascript:void(0);" class="order_id">${order.name}</a>
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
      const inventoryPolicy = item.variant?.inventoryPolicy ? item.variant.inventoryPolicy : '';
      const productUrl = item.product && item.product?.onlineStoreUrl ? item.product.onlineStoreUrl : '';
      const imageUrl = item.product && item.product?.featuredImage && item.product.featuredImage.url ? item.product.featuredImage.url + '&width=100&height=100' : '';
      const productPrice = item.price ? item.price : '';
      const minusButton = this.shadowRoot.querySelectorAll('.minus__button');
      const plusButton = this.shadowRoot.querySelectorAll('.plus__button');
      const addToCartButton = this.shadowRoot.querySelectorAll('.add-to-cart-button');
      const createDraftOrderButton = this.shadowRoot.querySelector('.create-draft-order-button');
      const isAvailable = inventoryQuantity < 0 && inventoryPolicy == 'continue' || inventoryQuantity > 0 && inventoryPolicy == 'deny';
      minusButton.forEach(button => {
        button.addEventListener('click', () => {
          this.updateQuantity(button, false);
        });
      });
      plusButton.forEach(button => {
        button.addEventListener('click', () => {
          this.updateQuantity(button, true);
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
          // console.log('Items added:', json);
          addToCartButton.innerHTML = window.String.reOrderSelectedItems;
          var x = document.getElementById('account-drawer-notif');
          x.textContent = 'Items Added to Cart';
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

  createDraftOrder() {
    const createDraftOrderButton = this.shadowRoot.querySelector('.create-draft-order-button');
    const orderQuantitySpinners = this.shadowRoot.querySelectorAll('.order-qty-spinner');
    let orderListData = [];
    createDraftOrderButton.innerHTML = `<div class="loading-overlay__spinner">
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
        orderListData.push({ variant_id: parseInt(variantId), quantity: quantity });
      }
    });

    const payload = {
      customer_id: JSON.parse(localStorage.getItem('currentAccount')).customerID ?? '',
      line_items: orderListData
    };

    const { authToken } = window.customerOrdersApp;
    const headers = new Headers({
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    });

    fetch(`${window.customerOrdersApp.urlProxy}api/v1/order/draft`, {
      body: JSON.stringify(payload),
      credentials: 'same-origin',
      headers,
      method: 'POST'
    })
      .then(response => response.json())
      .then(json => {
        // console.log('Draft Order created:', json);
        createDraftOrderButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M441 58.9L453.1 71c9.4 9.4 9.4 24.6 0 33.9L424 134.1 377.9 88 407 58.9c9.4-9.4 24.6-9.4 33.9 0zM209.8 256.2L344 121.9 390.1 168 255.8 302.2c-2.9 2.9-6.5 5-10.4 6.1l-58.5 16.7 16.7-58.5c1.1-3.9 3.2-7.5 6.1-10.4zM373.1 25L175.8 222.2c-8.7 8.7-15 19.4-18.3 31.1l-28.6 100c-2.4 8.4-.1 17.4 6.1 23.6s15.2 8.5 23.6 6.1l100-28.6c11.8-3.4 22.5-9.7 31.1-18.3L487 138.9c28.1-28.1 28.1-73.7 0-101.8L474.9 25C446.8-3.1 401.2-3.1 373.1 25zM88 64C39.4 64 0 103.4 0 152V424c0 48.6 39.4 88 88 88H360c48.6 0 88-39.4 88-88V312c0-13.3-10.7-24-24-24s-24 10.7-24 24V424c0 22.1-17.9 40-40 40H88c-22.1 0-40-17.9-40-40V152c0-22.1 17.9-40 40-40H200c13.3 0 24-10.7 24-24s-10.7-24-24-24H88z"/></svg>
          Create Draft Order
        `;
        var x = document.getElementById('account-drawer-notif');
        x.textContent = 'Draft Order Created';
        x.className = 'show';
        setTimeout(function () {
          x.className = x.className.replace('show', '');
        }, 3000);
      })
      .catch(error => {
        console.error('Error creating draft order:', error);
      });
  }

  checkAndToggleATCButton() {
    const addToCartButton = this.shadowRoot.querySelector('.add-to-cart-button');
    const createDraftOrderButton = this.shadowRoot.querySelector('.create-draft-order-button');
    if (addToCartButton || createDraftOrderButton) {
      const orderQuantitySpinners = this.shadowRoot.querySelectorAll('.order-qty-spinner');
      const allZero = Array.from(orderQuantitySpinners).every(spinner => {
        const quantity = parseInt(spinner.querySelector('.quantity__input').value);
        return quantity <= 0;
      });
      const wishlistRows = this.shadowRoot.querySelectorAll('.wishlist_row');
      const anyUnavailable = Array.from(wishlistRows).every(row => {
        return row.getAttribute('data-available') === 'false';
      });
      if (addToCartButton) {
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
      if (createDraftOrderButton) {
        createDraftOrderButton.disabled = anyUnavailable;
        createDraftOrderButton.classList.toggle('disabled', anyUnavailable);
        if (allZero) {
          createDraftOrderButton.disabled = true;
          createDraftOrderButton.classList.add('disabled');
        } else {
          createDraftOrderButton.disabled = false;
          createDraftOrderButton.classList.remove('disabled');
        }
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
        // console.log(data.data);
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
      } else if (event.target.matches('.create-draft-order-button')) {
        this.createDraftOrder();
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
                </div>
              </div>
            </div>
            <div class="nf-my-orders__table recently_ordered">
              <div class="account-product__grid">
              ${this.renderLineItems()}
              </div>
              <div class="re-order-cta-btn--wrapper">
              ${localStorage.getItem('currentAccount') ? ` <button
              class="re-order-cta re-order-btn create-draft-order-button"
              style="background-color: #fbe04c;"
            >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M441 58.9L453.1 71c9.4 9.4 9.4 24.6 0 33.9L424 134.1 377.9 88 407 58.9c9.4-9.4 24.6-9.4 33.9 0zM209.8 256.2L344 121.9 390.1 168 255.8 302.2c-2.9 2.9-6.5 5-10.4 6.1l-58.5 16.7 16.7-58.5c1.1-3.9 3.2-7.5 6.1-10.4zM373.1 25L175.8 222.2c-8.7 8.7-15 19.4-18.3 31.1l-28.6 100c-2.4 8.4-.1 17.4 6.1 23.6s15.2 8.5 23.6 6.1l100-28.6c11.8-3.4 22.5-9.7 31.1-18.3L487 138.9c28.1-28.1 28.1-73.7 0-101.8L474.9 25C446.8-3.1 401.2-3.1 373.1 25zM88 64C39.4 64 0 103.4 0 152V424c0 48.6 39.4 88 88 88H360c48.6 0 88-39.4 88-88V312c0-13.3-10.7-24-24-24s-24 10.7-24 24V424c0 22.1-17.9 40-40 40H88c-22.1 0-40-17.9-40-40V152c0-22.1 17.9-40 40-40H200c13.3 0 24-10.7 24-24s-10.7-24-24-24H88z"/></svg>
            Create Draft Order
            </button>` : `<button
              class="re-order-cta re-order-btn add-to-cart-button"
            >
            ${window.String.reOrderSelectedItems}
            </button>` }
                
               
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