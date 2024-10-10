function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

document.addEventListener('DOMContentLoaded', function () {
  function hideOrderTabs() {
    const targets = ["top-ordered__tab", "wishlist"];
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
    // window.removeSessionRefreshTokenTracking();
    window.location.reload();
    return;
  }

  const drawer = document.querySelector('#nf_drawer');
  const logoutBtn = document.querySelector('.logout_btn') || null;
  const customerSearchInput = document.getElementById('customerSearchInput');
  const customerSearchDropdown = document.getElementById('customerSearchDropdown');

  let customers = [];
  let searchField = 'company';
  const searchFields = document.querySelectorAll('.nf-search-field-btn');

  

  searchFields.forEach(field => {
    field.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      searchFields.forEach(f => f.classList.remove('active'));
      this.classList.add('active'); 
      searchFields.forEach(f => f.style.backgroundColor = ''); 
      customerSearchInput.value = '';
    });
  });

  const nf_drawer_icon = document.querySelector('.nf-cart-drawer-icon') || null;
  if (nf_drawer_icon) {
    document.querySelector('.nf-cart-drawer-icon').addEventListener('click', (event) => {
      location.href = '/cart';
    });
  }

  document.body.addEventListener('click', (event) => {

    const isSearchFieldButton = event.target.closest('.nf-search-field-btn'); 
    if (isSearchFieldButton) {
        return;
    }

    const closeDrawerButton = event.target.closest('.nf-close-dialog');
    if (closeDrawerButton) {
      drawer.removeAttribute('open');
      document.body.classList.remove('nf-dialog-open'); 
    }
  });
  const wishlistLoggedOut = document.querySelectorAll('.wishlist__logged_out');
  wishlistLoggedOut.forEach((item) => {
    item.addEventListener('click', async () => {
      drawer.setAttribute('open', '');
      document.body.classList.add('nf-dialog-open');
      await window.refreshTokenIfNeeded();
    });
  });


  document.body.addEventListener('click', async (event) => {
    const openDrawerButton = event.target.closest('.nf_show_dialog');
    if (openDrawerButton) {
      drawer.setAttribute('open', '');
      document.body.classList.add('nf-dialog-open'); 
      await window.refreshTokenIfNeeded();
    }
  });

  document.querySelector('.nf-drawer').addEventListener('click', (event) => {
    if (event.target === document.querySelector('.nf-drawer')) {
      drawer.removeAttribute('open');
      document.body.classList.remove('nf-dialog-open');
    }
  });

const initDialogScroll = () => {
  const dialog = document.querySelector('dialog');
  
  const openDialog = () => {
    dialog.showModal();
    document.body.classList.add('nf-dialog-open');
  };

  const closeDialog = () => {
    dialog.classList.add('hide');
    dialog.addEventListener('webkitAnimationEnd', function() {
      dialog.classList.remove('hide');
      dialog.close();
      document.body.classList.remove('nf-dialog-open'); // Enable body scroll
      dialog.removeEventListener('webkitAnimationEnd', arguments.callee, false);
    }, false);
  };

  const closeDialogButton = document.querySelector('.nf-close-dialog');
  if (closeDialogButton) {
    closeDialogButton.onclick = closeDialog;
  }

  // Optionally, open the dialog programmatically or via a specific event
  // openDialog();
};

initDialogScroll();

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
  var content = document.querySelector('.nf-dropdown-content') || null;
  var caret = document.querySelector('.nf-dropdown-caret') || null;

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
  if (accountNumber === '0' || accountNumber === '1') {
    drawer.setAttribute('open', '');
  }

  // Super user settings with sample data 
  const switchAccountBtn = document.querySelectorAll('switchAccountBtn') || null;
  const accountModal = document.getElementById('accountModal') || null;
  const cancelBtn = document.getElementById('cancelBtn') || null;
  const confirmBtn = document.getElementById('confirmBtn') || null;
  const ordersComponent = document.querySelector('nf-customer-orders') || null;
  const selectedAccountDisplay = document.getElementById('selectedAccountDisplay') || null;
  const selectedAccountLocationName = document.getElementById('selectedAccountLocationName') || null;
  const revertBtn = document.getElementById('revertBtn') || null;
  const customerProfileName = document.getElementById('customerProfileName') || null;
  let currentAccount = localStorage.getItem('currentAccount') || null;
  let previousAccount = null;


  let currentAccountData = JSON.parse(localStorage.getItem('currentAccount')) ?? '';
  if (currentAccountData) {
    currentAccount = currentAccountData.customerID;
    const displayName = (currentAccountData.firstName && currentAccountData.lastName) ?
      `${currentAccountData.firstName} ${currentAccountData.lastName}` :
      currentAccountData.email;
    updateSelectedAccountDisplay(displayName, currentAccountData.companyName);
    customerProfileName.innerHTML = `<div class="customer__wrapper">
        <div class="customer_details_wrapper">
         <div class="customer__name_details">
          <span class="customer_details">
            <span class="customer__badge">
            <svg width="14" height="14" viewBox="0 0 20 20" focusable="false" aria-hidden="true"><path fill-rule="evenodd" d="M10 3a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm-2 3.5a2 2 0 1 1 4 0 2 2 0 0 1-4 0Z"></path><path fill-rule="evenodd" d="M15.484 14.227a6.274 6.274 0 0 0-10.968 0l-.437.786a1.338 1.338 0 0 0 1.17 1.987h9.502a1.338 1.338 0 0 0 1.17-1.987l-.437-.786Zm-9.657.728a4.773 4.773 0 0 1 8.346 0l.302.545h-8.95l.302-.545Z"></path></svg>
            </span>
            <div class="customer_b2b-list">
            <div>
              ${currentAccountData.company ? `${currentAccountData.company} | ` : ``}
              ${currentAccountData.city ? `${currentAccountData.city} | ` : ``}
              ${currentAccountData.firstName && currentAccountData.lastName ? `${currentAccountData.firstName} ${currentAccountData.lastName} | ` : ``}
              ${currentAccountData.address1 ? `${currentAccountData.address1} |` : ``}
              <a href="https://admin.shopify.com/store/dejongwebshop/customers/${currentAccountData.customerID}" target="_blank">
                ${currentAccountData.email ? `${currentAccountData.email}` : ``}
              </a>
            </div>
            <div class="company__name_details">
                ${currentAccountData.companyName ? `
                  <span class="customer__company-badge">
                  <span class="company__icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M10.4949 14.501L10.4941 21.999H7.49913L7.49989 14.501H10.4949ZM17.2546 13.001H13.7532C13.339 13.001 13.0032 13.3368 13.0032 13.751V17.253C13.0032 17.6672 13.339 18.003 13.7532 18.003H17.2546C17.6688 18.003 18.0046 17.6672 18.0046 17.253V13.751C18.0046 13.3368 17.6688 13.001 17.2546 13.001ZM16.5039 14.501V16.503H14.5029V14.501H16.5039ZM8.16589 7.002H3.50089L3.501 8.16674C3.501 9.34763 4.37852 10.3236 5.51705 10.478L5.67387 10.4939L5.83357 10.4993C7.06813 10.4993 8.07869 9.54019 8.16076 8.32644L8.16614 8.16674L8.16589 7.002ZM14.3309 7.002H9.66589L9.66614 8.16674C9.66614 9.34763 10.5437 10.3236 11.6822 10.478L11.839 10.4939L11.9987 10.4993C13.2333 10.4993 14.2438 9.54019 14.3259 8.32644L14.3313 8.16674L14.3309 7.002ZM20.4979 7.002H15.8329L15.8336 8.16674C15.8336 9.34763 16.7112 10.3236 17.8497 10.478L18.0065 10.4939L18.1662 10.4993C19.4008 10.4993 20.4113 9.54019 20.4934 8.32644L20.4988 8.16674L20.4979 7.002ZM9.06051 3.5H6.32589L4.46889 5.502H8.44551L9.06051 3.5ZM13.3685 3.5H10.6305L10.0145 5.502H13.9845L13.3685 3.5ZM17.6729 3.5H14.9385L15.5535 5.502H19.5299L17.6729 3.5ZM2.20117 5.74193L5.45006 2.23991C5.56833 2.11243 5.7264 2.03081 5.89656 2.00715L5.99989 2H17.9999C18.1738 2 18.3411 2.06037 18.4742 2.16902L18.5497 2.23991L21.822 5.76824L21.8527 5.80714C21.9544 5.94281 22.0003 6.09665 22.0003 6.24775L21.9988 8.16674C21.9988 9.16092 21.6202 10.0667 20.9994 10.7478L20.9986 21.25C20.9986 21.6297 20.7165 21.9435 20.3504 21.9932L20.2486 22L11.9951 21.999L11.9958 13.751C11.9958 13.3368 11.6601 13.001 11.2458 13.001H6.74989C6.33568 13.001 5.99989 13.3368 5.99989 13.751L5.99913 21.999L3.75113 22C3.37144 22 3.05764 21.7178 3.00798 21.3518L3.00113 21.25L3.00035 10.7478C2.42084 10.112 2.05244 9.28045 2.00598 8.36396L2.001 8.16674L2.0008 6.29097C1.99273 6.15366 2.02238 6.01238 2.09673 5.88313L2.14651 5.807L2.20117 5.74193Z"
                        fill="#666" />
                    </svg>
                    </span>
                     <small>
                       <a href="https://admin.shopify.com/store/dejongwebshop/companies/${currentAccountData.companyId}/locations/${currentAccountData.companyLocationId}" target="_blank">
                        ${currentAccountData.companyName ? `${currentAccountData.companyName} ${currentAccountData.companyLocationName ? `(${currentAccountData.companyLocationName})` : ``}` : ``}
                       </a>
                     </small>

                      </span>` : ``}
                    </div>
                </span>
              </div>
            </div>
        </div>
        </div>`;
    if (revertBtn) {
      revertBtn.style.display = 'inline-block';
    }
    hideOrderTabs();
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
      // window.removeSessionRefreshTokenTracking();
      window.location.reload();
    });
  }
  document.querySelectorAll('.switchAccount__btn').forEach(button => {
    button.addEventListener('click', async () => {
      await window.refreshTokenIfNeeded();
      accountModal.showModal();
    });
  });
  if (revertBtn) {
    revertBtn.addEventListener('click', () => {
      localStorage.removeItem('currentAccount');
      revertBtn.style.display = 'none';
      window.location.reload();
      console.log('rever button clicked');
    });
  }
  confirmBtn.addEventListener('click', () => {
    const selectedAccountId = customerSearchInput.dataset.value;
    const selectedCompanyElement = document.querySelector('#companyListWrapper .selected-company-item') || "";
    let selectedCompanyId = "";
    let selectedCompanyName = "";
    let selectedCompanyLocationName = "";
    let selectedCompanyContactId = "";
    let selectedCompanyLocationId = "";
    if (selectedCompanyElement) {
      selectedCompanyId = selectedCompanyElement.dataset.companyId || "";
      selectedCompanyName = selectedCompanyElement.querySelector('.nf-company-name').textContent || "";
      selectedCompanyLocationName = selectedCompanyElement.querySelector('.nf-company-location').textContent || "";
      selectedCompanyContactId = selectedCompanyElement.dataset.companyContactId || "";
      selectedCompanyLocationId = selectedCompanyElement.dataset.companyLocationId || "";
    }
    const selectedCustomer = customers.find(customer => customer.id == selectedAccountId) ?? currentAccount.customerID;
    if (currentAccount === selectedAccountId) {
      let currentAccountData = JSON.parse(localStorage.getItem('currentAccount')) || {};
      currentAccountData.company = selectedCompanyName || currentAccountData.company || "";
      currentAccountData.companyId = selectedCompanyId || currentAccountData.companyId || "";
      currentAccountData.companyName = selectedCompanyName || currentAccountData.companyName || "";
      currentAccountData.companyLocationName = selectedCompanyLocationName || currentAccountData.companyLocationName || "";
      currentAccountData.companyContactId = selectedCompanyContactId || currentAccountData.companyContactId || "";
      currentAccountData.companyLocationId = selectedCompanyLocationId || currentAccountData.companyLocationId || "";
      localStorage.setItem('currentAccount', JSON.stringify(currentAccountData));
    } else {
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
        company: selectedCompanyName || selectedCustomer.default_address?.company || "",
        companyId: selectedCompanyId,
        companyName: selectedCompanyName || selectedCustomer.default_address?.company || "",
        companyLocationName: selectedCompanyLocationName,
        companyContactId: selectedCompanyContactId,
        companyLocationId: selectedCompanyLocationId
      };

      localStorage.setItem('currentAccount', JSON.stringify(accountData));
    }

    let accountDisplayName = JSON.parse(localStorage.getItem('currentAccount'));
    const displayAccountName = (accountDisplayName.firstName && accountDisplayName.lastName) ?
      `${accountDisplayName.firstName} ${accountDisplayName.lastName}` :
      accountDisplayName.email;
    updateSelectedAccountDisplay(displayAccountName, accountDisplayName.companyName);

    customerProfileName.innerHTML = `<div class="customer__wrapper">
      <div class="customer_details_wrapper">
        <div class="customer__name_details">
          <span class="customer_details">
            <span class="customer__badge">
            <svg width="14" height="14" viewBox="0 0 20 20" focusable="false" aria-hidden="true"><path fill-rule="evenodd" d="M10 3a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm-2 3.5a2 2 0 1 1 4 0 2 2 0 0 1-4 0Z"></path><path fill-rule="evenodd" d="M15.484 14.227a6.274 6.274 0 0 0-10.968 0l-.437.786a1.338 1.338 0 0 0 1.17 1.987h9.502a1.338 1.338 0 0 0 1.17-1.987l-.437-.786Zm-9.657.728a4.773 4.773 0 0 1 8.346 0l.302.545h-8.95l.302-.545Z"></path></svg>
            </span>
            <div class="customer_b2b-list">
            <div>
              ${accountDisplayName.company ? `${accountDisplayName.company} | ` : ``}
              ${accountDisplayName.city ? `${accountDisplayName.city} | ` : ``}
              ${accountDisplayName.firstName && accountDisplayName.lastName ? `${accountDisplayName.firstName} ${accountDisplayName.lastName} | ` : ``}
              ${accountDisplayName.address1 ? `${accountDisplayName.address1} |` : ``}
              <a href="https://admin.shopify.com/store/dejongwebshop/customers/${accountDisplayName.customerID}" target="_blank">
              ${accountDisplayName.email ? `${accountDisplayName.email}` : ``}
              </a>
            </div>
            <div class="company__name_details">
                ${accountDisplayName.companyName ? `
                  <span class="customer__company-badge">
                  <span class="company__icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M10.4949 14.501L10.4941 21.999H7.49913L7.49989 14.501H10.4949ZM17.2546 13.001H13.7532C13.339 13.001 13.0032 13.3368 13.0032 13.751V17.253C13.0032 17.6672 13.339 18.003 13.7532 18.003H17.2546C17.6688 18.003 18.0046 17.6672 18.0046 17.253V13.751C18.0046 13.3368 17.6688 13.001 17.2546 13.001ZM16.5039 14.501V16.503H14.5029V14.501H16.5039ZM8.16589 7.002H3.50089L3.501 8.16674C3.501 9.34763 4.37852 10.3236 5.51705 10.478L5.67387 10.4939L5.83357 10.4993C7.06813 10.4993 8.07869 9.54019 8.16076 8.32644L8.16614 8.16674L8.16589 7.002ZM14.3309 7.002H9.66589L9.66614 8.16674C9.66614 9.34763 10.5437 10.3236 11.6822 10.478L11.839 10.4939L11.9987 10.4993C13.2333 10.4993 14.2438 9.54019 14.3259 8.32644L14.3313 8.16674L14.3309 7.002ZM20.4979 7.002H15.8329L15.8336 8.16674C15.8336 9.34763 16.7112 10.3236 17.8497 10.478L18.0065 10.4939L18.1662 10.4993C19.4008 10.4993 20.4113 9.54019 20.4934 8.32644L20.4988 8.16674L20.4979 7.002ZM9.06051 3.5H6.32589L4.46889 5.502H8.44551L9.06051 3.5ZM13.3685 3.5H10.6305L10.0145 5.502H13.9845L13.3685 3.5ZM17.6729 3.5H14.9385L15.5535 5.502H19.5299L17.6729 3.5ZM2.20117 5.74193L5.45006 2.23991C5.56833 2.11243 5.7264 2.03081 5.89656 2.00715L5.99989 2H17.9999C18.1738 2 18.3411 2.06037 18.4742 2.16902L18.5497 2.23991L21.822 5.76824L21.8527 5.80714C21.9544 5.94281 22.0003 6.09665 22.0003 6.24775L21.9988 8.16674C21.9988 9.16092 21.6202 10.0667 20.9994 10.7478L20.9986 21.25C20.9986 21.6297 20.7165 21.9435 20.3504 21.9932L20.2486 22L11.9951 21.999L11.9958 13.751C11.9958 13.3368 11.6601 13.001 11.2458 13.001H6.74989C6.33568 13.001 5.99989 13.3368 5.99989 13.751L5.99913 21.999L3.75113 22C3.37144 22 3.05764 21.7178 3.00798 21.3518L3.00113 21.25L3.00035 10.7478C2.42084 10.112 2.05244 9.28045 2.00598 8.36396L2.001 8.16674L2.0008 6.29097C1.99273 6.15366 2.02238 6.01238 2.09673 5.88313L2.14651 5.807L2.20117 5.74193Z"
                        fill="#666" />
                    </svg>
                    </span> <small>
                    <a href="https://admin.shopify.com/store/dejongwebshop/companies/${accountDisplayName.companyId}/locations/${accountDisplayName.companyLocationId}" target="_blank">
                    ${accountDisplayName.companyName ? `${accountDisplayName.companyName} ${accountDisplayName.companyLocationName ? `(${accountDisplayName.companyLocationName})` : ``}` : ``}
                    </a>
                    </small>
                      </span>` : ``}
                    </div>
                </span>
              </div>
            </div>
        </div>
        </div>`;

    revertBtn.style.display = 'inline-block';
    accountModal.close();
    ordersComponent.setState({ view: 'orders' });
    ordersComponent.fetchOrders();
    ordersComponent.fetchProductOrderList();
    hideOrderTabs();
  });
  function updateSelectedAccountDisplay(accountName, companyName) {
    selectedAccountDisplay.innerHTML = `<span class="customer__badge">Customer</span> <span class="account__name">${accountName || ''}</span>`;
    if (selectedAccountLocationName) {
      selectedAccountLocationName.innerHTML = `${companyName || ''}`;
    }
  }
 
  
  const debouncedFetchCustomerList = debounce(fetchCustomerList, 300);

  customerSearchInput.addEventListener('input', function () {
    const query = this.value.trim();
    if (query.length > 0) {
      debouncedFetchCustomerList(query);
      customerSearchDropdown.style.display = 'block';
    } else {
      customerSearchDropdown.style.display = 'none';
    }
  });

  async function fetchCustomerList(query) {
    await window.refreshTokenIfNeeded();
    const customerListLoader = document.querySelector('.customerListLoader');
    customerListLoader.classList.remove('nf-hidden');
    const { url, authToken } = window.customerOrdersApp;
    const headers = new Headers({
      'Authorization': `Bearer ${authToken}`
    });
    const requestOptions = {
      method: 'GET',
      headers
    };
    fetch(`${window.customerOrdersApp.urlProxy}api/v1/customer/list?items=25&sort=desc&field=${searchField}&search=${encodeURIComponent(query)}`, requestOptions)
      .then(response => response.json())
      .then(data => {
        customers = data.data;
        populateCustomerList(customers);
        customerListLoader.classList.add('nf-hidden');
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
        if (customer?.default_address?.city) {
          liTextContent.push(customer.default_address.city);
        }
        if (customer?.first_name && customer?.last_name) {
          liTextContent.push(`${customer.first_name} ${customer.last_name}`);
        }
      } else {
        if (customer?.first_name && customer?.last_name) {
          liTextContent.push(`${customer.first_name} ${customer.last_name}`);
        }
        if (customer?.default_address?.city) {
          liTextContent.push(customer.default_address.city);
        }
      }
      if (customer?.email) {
        liTextContent.push(customer.email);
      }
      li.textContent = liTextContent.join(',  ').trim();
      li.dataset.value = customer.id;
      li.dataset.email = customer.email;
      customerSearchDropdown.appendChild(li);
    });
  }

  window.updateSearchField = function (field) {
    searchField = field;
    document.querySelectorAll('.nf-search-field-btn').forEach(btn => btn.style.backgroundColor = '');
    return false;
  };

  document.getElementById('customerSearchInput').addEventListener('input', function () {
    const selectedCompanyDisplay = document.getElementById('selectedCompanyDisplay');
    const query = this.value.trim();
    if (query.length > 0) {
      debouncedFetchCustomerList(query);
      customerSearchDropdown.style.display = 'block';

      clearCompanyData();
    } else {
      customerSearchDropdown.style.display = 'none';
      selectedCompanyDisplay.classList.add('nf-hidden');
      clearCompanyData();
      document.getElementById('confirmBtn').classList.add('disabled');
    }
  });
  document.getElementById('customerSearchDropdown').addEventListener('click', function (event) {
    const selectedCustomer = event.target;
    customerSearchInput.value = selectedCustomer.textContent;
    customerSearchInput.dataset.company = selectedCustomer.dataset.company;
    customerSearchInput.dataset.value = selectedCustomer.dataset.value;
    const customerEmail = selectedCustomer.dataset.email;
    fetchCompanyDetails(customerEmail);
    customerSearchDropdown.style.display = 'none';
  });
  async function fetchCompanyDetails(customerEmail) {
    await window.refreshTokenIfNeeded();
    const { url, authToken } = window.customerOrdersApp;
    const headers = new Headers({
      'Authorization': `Bearer ${authToken}`
    });
    const requestOptions = {
      method: 'GET',
      headers
    };
    const companyLoader = document.querySelector('.companyListLoader');
    const confirmBtn = document.getElementById('confirmBtn');
    companyLoader.classList.remove('nf-hidden');
    fetch(`${window.customerOrdersApp.urlProxy}api/v1/customer/company?email=${encodeURIComponent(customerEmail)}`, requestOptions)
      .then(response => response.json())
      .then(data => {
        if (data.data && data.data.length > 0) {
          populateCompanyDropdown(data.data);
        } else {
          clearCompanyData();
          confirmBtn.classList.remove('disabled');
        }
      })
      .catch(error => {
        console.error('Error fetching company details:', error);
        clearCompanyData();
      })
      .finally(() => {
        companyLoader.classList.add('nf-hidden');
      });
  }
  function clearCompanyData() {
    let currentAccountData = JSON.parse(localStorage.getItem('currentAccount')) || {};
    currentAccountData.company = "";
    currentAccountData.companyId = "";
    currentAccountData.companyName = "";
    currentAccountData.companyLocationName = "";
    localStorage.setItem('currentAccount', JSON.stringify(currentAccountData));

    const selectedCompanyDisplay = document.getElementById('selectedCompanyDisplay');
    const selectedCompanyName = document.querySelector('.nf-dropdown-list .location') || null;
    const companyList = document.querySelector('.nf-company-list') || null;

    if (companyList) {
      companyList.remove();
    }
    selectedCompanyDisplay.innerHTML = '';
    if (selectedCompanyName) selectedCompanyName.classList.add('nf-hidden');
    selectedCompanyDisplay.classList.add('nf-hidden');
  }

  function populateCompanyDropdown(companies) {
    const companyListWrapper = document.getElementById('companyListWrapper');
    const confirmBtn = document.getElementById('confirmBtn');
    const selectedCompanyDisplay = document.getElementById('selectedCompanyDisplay');
    companyListWrapper.innerHTML = '';
    selectedCompanyDisplay.innerHTML = '';

    const companyList = document.createElement('ul');
    companyList.classList.add('nf-company-list');

    // Populate the dropdown with actual companies
    companies.forEach(company => {
      const listItem = document.createElement('li');
      listItem.classList.add('nf-company-list-item');
      listItem.dataset.companyId = company.company_id || '';
      listItem.dataset.companyName = company.company_name || '';
      listItem.dataset.companyLocationName = company.company_location_name || '';
      listItem.dataset.companyContactId = company.company_contact_id || '';
      listItem.dataset.companyLocationId = company.company_location_id || '';

      listItem.innerHTML = `
          <div class="nf-company-name">${company.company_name || ''}</div>
          <div class="nf-company-location"><small>${company.company_location_name || ''}</small></div>
      `;
      listItem.addEventListener('click', function () {
        const previouslySelected = document.querySelector('.selected-company-item');
        if (previouslySelected) {
          previouslySelected.classList.remove('selected-company-item');
        }
        this.classList.add('selected-company-item');
        const selectedCompany = this.querySelector('.nf-company-name').textContent;
        const selectedLocation = this.querySelector('.nf-company-location').textContent;
        confirmBtn.classList.remove('disabled')
        selectedCompanyDisplay.innerHTML = `
              <div class="nf-selected-company">
                  <div class="nf-company--details">
                      <div class="nf-selected__company-badge">Selected Company</div>
                      <div class="">
                          <span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M10.4949 14.501L10.4941 21.999H7.49913L7.49989 14.501H10.4949ZM17.2546 13.001H13.7532C13.339 13.001 13.0032 13.3368 13.0032 13.751V17.253C13.0032 17.6672 13.339 18.003 13.7532 18.003H17.2546C17.6688 18.003 18.0046 17.6672 18.0046 17.253V13.751C18.0046 13.3368 17.6688 13.001 17.2546 13.001ZM16.5039 14.501V16.503H14.5029V14.501H16.5039ZM8.16589 7.002H3.50089L3.501 8.16674C3.501 9.34763 4.37852 10.3236 5.51705 10.478L5.67387 10.4939L5.83357 10.4993C7.06813 10.4993 8.07869 9.54019 8.16076 8.32644L8.16614 8.16674L8.16589 7.002ZM14.3309 7.002H9.66589L9.66614 8.16674C9.66614 9.34763 10.5437 10.3236 11.6822 10.478L11.839 10.4939L11.9987 10.4993C13.2333 10.4993 14.2438 9.54019 14.3259 8.32644L14.3313 8.16674L14.3309 7.002ZM20.4979 7.002H15.8329L15.8336 8.16674C15.8336 9.34763 16.7112 10.3236 17.8497 10.478L18.0065 10.4939L18.1662 10.4993C19.4008 10.4993 20.4113 9.54019 20.4934 8.32644L20.4988 8.16674L20.4979 7.002ZM9.06051 3.5H6.32589L4.46889 5.502H8.44551L9.06051 3.5ZM13.3685 3.5H10.6305L10.0145 5.502H13.9845L13.3685 3.5ZM17.6729 3.5H14.9385L15.5535 5.502H19.5299L17.6729 3.5ZM2.20117 5.74193L5.45006 2.23991C5.56833 2.11243 5.7264 2.03081 5.89656 2.00715L5.99989 2H17.9999C18.1738 2 18.3411 2.06037 18.4742 2.16902L18.5497 2.23991L21.822 5.76824L21.8527 5.80714C21.9544 5.94281 22.0003 6.09665 22.0003 6.24775L21.9988 8.16674C21.9988 9.16092 21.6202 10.0667 20.9994 10.7478L20.9986 21.25C20.9986 21.6297 20.7165 21.9435 20.3504 21.9932L20.2486 22L11.9951 21.999L11.9958 13.751C11.9958 13.3368 11.6601 13.001 11.2458 13.001H6.74989C6.33568 13.001 5.99989 13.3368 5.99989 13.751L5.99913 21.999L3.75113 22C3.37144 22 3.05764 21.7178 3.00798 21.3518L3.00113 21.25L3.00035 10.7478C2.42084 10.112 2.05244 9.28045 2.00598 8.36396L2.001 8.16674L2.0008 6.29097C1.99273 6.15366 2.02238 6.01238 2.09673 5.88313L2.14651 5.807L2.20117 5.74193Z"
                              fill="#212121" />
                          </svg></span> <strong>${selectedCompany}</strong>
                      </div>
                      <small>${selectedLocation}</small>
                  </div>
              </div>
          `;


        confirmBtn.classList.remove('disabled');
        companyListWrapper.classList.add('nf-hidden');
        selectedCompanyDisplay.classList.remove('nf-hidden');
      });

      companyList.appendChild(listItem);
    });

    companyListWrapper.appendChild(companyList);
    companyListWrapper.classList.remove('nf-hidden');
    selectedCompanyDisplay.classList.add('nf-hidden');
  }

  document.querySelectorAll('.nf-company-list-item').forEach(item => {
    item.addEventListener('click', function () {
      const selectedCompanyId = this.dataset.companyId;
      console.log('Selected Company ID:', selectedCompanyId);
    });
  });

  async function loadAccountData(accountId) {
    ordersComponent.fetchOrders(`email=${encodeURIComponent(accountId)}`);
  }

  
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
      previousPage: null,
      temporaryWishlist: []
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
  setOrders(orders) {
    this.state.orders = orders;
    this.render();
  }
  
  fetchProductOrderList = async () => {
    const productListContainer = document.getElementById("product__list");
    productListContainer.innerHTML = `
      <div class="nf-loader-overlay">
          <div class="nf-spinner"></div>
      </div>`;
  
    await window.refreshTokenIfNeeded();
    const currentAccountData = JSON.parse(localStorage.getItem('currentAccount'));
    const { authToken } = window.customerOrdersApp;
    const email = encodeURIComponent(currentAccountData?.email ?? window.String.customerEmail);
    const productListUrl = `${window.customerOrdersApp.urlProxy}api/v1/customer/product-list?email=${email}`;
    const pricingApiUrl = `${window.customerOrdersApp.urlProxy}api/v1/customer/product-pricing?company_location_id=${currentAccountData?.companyLocationId || (window.String.currentLocationID ? window.String.currentLocationID : window.String.customerId)}${currentAccountData?.email ? `&email=${email}` : ``}`;
    const productDetailsUrl = `${window.customerOrdersApp.urlProxy}api/v1/customer/product-details-list?email=${email}`;
    const productOrderHistoryUrl = `${window.customerOrdersApp.urlProxy}api/v1/customer/product-order-history?email=${email}`;
    const token = 'Bearer ' + authToken;

    try {
      const productListResponse = await fetch(productListUrl, {
        method: 'GET',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });
  
      if (!productListResponse.ok) {
        throw new Error(`HTTP error! Status: ${productListResponse.status}`);
      }
  
      const productListData = await productListResponse.json();
      const productIds = productListData.data.map(product => product.id);
      this.state.temporaryWishlist = [...productIds]; 
  
      const addToFavouriteBtn = document.querySelectorAll('.nf-add-to-favourite');
      addToFavouriteBtn.forEach(button => {
        const productId = button.dataset.productId;
        this.updateWishlistIcon(button, productId);
      });

      const wishlistLoader = document.querySelector('#nf-wishlist-loading-spinner');
      const addToFavouritePDP = document.querySelector('.nf-add-to-favourite-pdp');
      if(wishlistLoader) {
        wishlistLoader.classList.add('nf-hidden');
        addToFavouritePDP.classList.remove('nf-hidden');
      }
      
      addToFavouriteBtn.forEach(button => {
        button.addEventListener('click', (event) => {
          const buttonElement = event.target.closest('button');
          if (buttonElement && buttonElement.dataset) {
            const productId = buttonElement.dataset.productId;
            this.toggleWishlistState(button, productId);
          } else {
            console.error('Button element or dataset not found');
          }
        });
      });
  
      let productGridHTML = '';
      productListData.data.forEach(product => {
        if (product) {
          productGridHTML += this.productGridItem({ ...product, metafields: [] }, true);
        }
      });

      
      productListContainer.innerHTML =
        `<div class="nf-my-orders__table recently_ordered js-list">
          ${productGridHTML}
        </div>
        <div class="nf__subtotal">
            <div class="nf__totals--row">
                <div class="nf__totals--text">${window.String.subtotalString} 
                <span class="nf__totals--lines-text">(0 ${window.String.product_items}, 0 ${window.String.line_item})</span>
                </div>
                <div class="nf__totals--price">${window.String.shopCurrency} <span class="nf__totals--price-text skeleton skeleton-text">&nbsp;</span></div>
            </div>
            
        </div>
        <div class="re-order-cta-btn--wrapper">
          <button class="re-order-cta orderlist-re-order-btn disabled">
            ${window.String.reOrderButtonText}
          </button>
        </div>
        `;


      const productListUpdatedEvent = new CustomEvent('productListUpdated');
      const draggableEvent = new CustomEvent('draggableEvent');
      document.dispatchEvent(productListUpdatedEvent);
      document.dispatchEvent(draggableEvent);
  
      const deleteButtons = document.querySelectorAll('.nf-delete-button');

      var deleteModal = document.getElementById("nf-delete-modal");
      var acceptDeleteBtn = document.querySelector(".delete-notif-button-accept");
      var cancelDeleteBtn = document.querySelector(".delete-notif-button-cancel");
      const loader = document.querySelector('.nf-loader-overlay');

      let productIdToDelete = null;
    
      const openDeleteModal = (productId) => {
      productIdToDelete = productId;
      deleteModal.style.display = "block";
      };
    
      const closeDeleteModal = () => {
      deleteModal.style.display = "none";
      productIdToDelete = null;
      };
    
      acceptDeleteBtn.addEventListener("click", async () => {
        if (productIdToDelete) {
          await this.removeProductFromOrderList(productIdToDelete);
        }
        closeDeleteModal();
      });
      cancelDeleteBtn.addEventListener("click", function() {
        closeDeleteModal();
      });
      
      deleteButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
          const productId = event.target.closest('button').dataset.productId;
          openDeleteModal(productId);
        });
      });
  
      const pricingResponse = await fetch(pricingApiUrl, {
        method: 'GET',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });

      const quantityOrderHistoryResponse = await fetch(productOrderHistoryUrl, {
        method: 'GET',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });

      if (quantityOrderHistoryResponse.ok) {
        await window.refreshTokenIfNeeded();
        const quantityOrderHistoryData = await quantityOrderHistoryResponse.json();
        this.updateTimesOrdered(quantityOrderHistoryData);
      }
  
      if (pricingResponse.ok) {
        await window.refreshTokenIfNeeded();
        const pricingData = await pricingResponse.json();
        this.updateProductPrices(pricingData);
      }
  
      const productDetailsResponse = await fetch(productDetailsUrl, {
        method: 'GET',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });
  
      if (!productDetailsResponse.ok) {
        throw new Error(`HTTP error! Status: ${productDetailsResponse.status}`);
      }
      if (productDetailsResponse.ok) {
        await window.refreshTokenIfNeeded();
        const productDetailsData = await productDetailsResponse.json();
      const productDetailsMap = {};
      productDetailsData?.data.forEach(detail => {
        productDetailsMap[detail?.id] = detail?.metafields;
      });
  
      productListData?.data.forEach(product => {
        const productMetafields = productDetailsMap[product?.id] || [];
        const piecesPerBoxMetafield = this.findMetafield(productMetafields, 'other', 'Pieces_per_box');
        if (piecesPerBoxMetafield) {
          const productElement = document.querySelector(`#product__list .wishlist_row[data-product-id="${product?.id}"] .inventory-box .account-content`);
          if (productElement) {
            productElement.classList.remove('skeleton');
            productElement.innerHTML = `<span>${window.boxIcon}</span>${piecesPerBoxMetafield.value} ${window.String.pieces_per_box}`;
          }
        }
      });
      }
  
      
  
      return productIds;
  
    } catch (error) {
      console.error('Failed to fetch products:', error);
      productListContainer.innerHTML = `<p>Error loading products. Please try again later.</p>`;
      return [];
    }
  };
  
   updateWishlistIcon(button, productId) {
    const isInWishlist = this.state.temporaryWishlist.includes(productId);
    if (isInWishlist) {
      button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-wishlist" viewBox="0 0 512 512">
        <path fill="#ff5146" d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z"/>
      </svg>`;
    } else {
      button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-wishlist" viewBox="0 0 512 512">
        <path fill="#d0d1d4" d="M225.8 468.2l-2.5-2.3L48.1 303.2C17.4 274.7 0 234.7 0 192.8v-3.3c0-70.4 50-130.8 119.2-144C158.6 37.9 198.9 47 231 69.6c9 6.4 17.4 13.8 25 22.3c4.2-4.8 8.7-9.2 13.5-13.3c3.7-3.2 7.5-6.2 11.5-9c0 0 0 0 0 0C313.1 47 353.4 37.9 392.8 45.4C462 58.6 512 119.1 512 189.5v3.3c0 41.9-17.4 81.9-48.1 110.4L288.7 465.9l-2.5 2.3c-8.2 7.6-19 11.9-30.2 11.9s-22-4.2-30.2-11.9zM239.1 145c-.4-.3-.7-.7-1-1.1l-17.8-20c0 0-.1-.1-.1-.1c0 0 0 0 0 0c-23.1-25.9-58-37.7-92-31.2C81.6 101.5 48 142.1 48 189.5v3.3c0 28.5 11.9 55.8 32.8 75.2L256 430.7 431.2 268c20.9-19.4 32.8-46.7 32.8-75.2v-3.3c0-47.3-33.6-88-80.1-96.9c-34-6.5-69 5.4-92 31.2c0 0 0 0-.1 .1s0 0-.1 .1l-17.8 20c-.3 .4-.7 .7-1 1.1c-4.5 4.5-10.6 7-16.9 7s-12.4-2.5-16.9-7z"/>
      </svg>`;
    }
  }
  
   toggleWishlistState(button, productId) {
    const isInWishlist = this.state.temporaryWishlist.includes(productId);
    if (isInWishlist) {
      this.state.temporaryWishlist = this.state.temporaryWishlist.filter(id => id !== productId); 
      this.updateWishlistIcon(button, productId);
      this.removeProductFromOrderList(productId);
    } else {
      this.state.temporaryWishlist.unshift(productId);
      this.updateWishlistIcon(button, productId);
      this.debouncedAddProductToOrderList(productId);
    }
  }

  productGridItem = (product, hasAdminPermission) => {
    function isVariantAvailable(variant) {
      return variant?.inventoryQuantity > 0 || variant?.inventoryPolicy === 'continue';
    }
    function translate(key, value = 0) {
      const translations = {
        "products.product.date-available-message": window.String.date_available_message,
        "products.product.sold_out": window.String.sold_out,
        "products.product.characteristics_label_boxesperpallet": window.String.characteristics_label_boxesperpallet,
        "products.product.inhoud_stuks": (stuks) => `${window.String.inhoud_wish} ${stuks} ${window.String.stuks_wish}`,
        "customer.account_drawer.stocked": window.String.stocked,
        "customer.account.times_ordered": window.String.times_ordered,
        "price.money": (price) => `€${(price / 100).toFixed(2).replace(".", ",")}`
      };
      return typeof translations[key] === "function" ? translations[key](value) : translations[key];
    }

    const totalInventory = product.variants.reduce((sum, variant) => sum + parseInt(variant?.inventoryQuantity || 0), 0);

    let productHTML = `
      <div class="product_grid_item account-product__grid is-idle js-item">
        <div class="wishlist_row" data-product-id="${product.id}" data-variant="${product.variants[0].id}">
          <div class="product-image-box">
            ${hasAdminPermission ? '<div class="nf-drag-handle nf-js-drag-handle"></div>' : ''}
            <a href="/products/${product?.handle}" class="no-decor">
              <div class="image-box">
                <div class="image_wrapper">
                  <img src="${product?.featuredImage?.url}&width=100&height=100" style="width: 100%" />
                </div>
              </div>
            </a>
          </div>
          <div class="desc-box">
            <div>
              <a href="/products/${product.handle}">
                <p class="product_title">${product.title}</p>
              </a>
            </div>
            <div class="price-box">
              ${isVariantAvailable(product.variants[0]) ? `<p class="price skeleton skeleton-text">&nbsp;</p>` : `<div class="account-outofstock">${translate("products.product.sold_out")}</div>`}
            </div>
            <div class="inventory-box">
              <div class="volume_stocks align-items-center">
                <div class="account-content skeleton">&nbsp;</div> <!-- Skeleton for Pieces_per_box -->
                <div>${product.variants[0]?.sku ? `<span>&bull;</span><div class="sku">SKU: ${product.variants[0]?.sku}</div>` : ''}</div>
                <div>${hasAdminPermission && window.String.customerTags?.includes(window.String.COA_ROLE_ADMIN) || !window.String.customerTags?.includes(window.String.COA_ROLE_ADMIN) && product.title.includes('custom') ? `<span>&bull;</span><div class="sku">${translate("customer.account_drawer.stocked")}: <span class="nf-stocked-count">${totalInventory}</span></div>` : ''}</div>
                <div class="sku times_order-wrapper"> <span>&bull;</span> ${translate("customer.account.times_ordered")}<span class="times_ordered skeleton skeleton-text times_ordered_text">&nbsp;</span></div>
                <div>
                 <button class="nf-delete-button" data-product-id="${product.id}">
                  ${window.String.remove_item_wishlist}
                </button>
                </div>
              </div>
            </div>
            ${isVariantAvailable(product.variants[0]) ? `
              <div class="quantity-spinner orderlist-quantity-spinner">
                <div class="quantity__box">
                  <button class="minus__button orderlist-minus__button" type="button">—</button>
                  <input class="quantity__input orderlist-quantity__input" type="number" value="0" min="0" tabindex="0">
                  <button class="plus__button orderlist-plus__button" type="button">+</button>
                </div>
                
              </div>
            ` : ''}
          </div>
        </div>
      </div>`;

    return productHTML;
  };

  debouncedAddProductToOrderList = debounce(async (productId) => {
    await this.addProductToOrderList(productId);
  }, 100);

  addProductToOrderList = async (newProductId) => {
    try {
      let existingProductIds = [...this.state.temporaryWishlist];
      existingProductIds = existingProductIds.filter(id => id !== newProductId);
      existingProductIds.unshift(newProductId);
  
      await window.refreshTokenIfNeeded();
      const currentAccountData = JSON.parse(localStorage.getItem('currentAccount'));
      const { authToken } = window.customerOrdersApp;
      const url = `${window.customerOrdersApp.urlProxy}api/v1/customer/product-list?email=${encodeURIComponent(currentAccountData?.email || window.String.customerEmail)}`;
      const token = 'Bearer ' + authToken;
  
      const productIdPayload = {
        products: existingProductIds,
      };
  
      const requestOptions = {
        method: 'PUT',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productIdPayload),
      };
  
      const response = await fetch(url, requestOptions);
      const notif = document.querySelector("#nf-wishlist-modal-notif");
      notif.style.display = "block";
      setTimeout(function () {
        notif.style.display = "none";
      }, 1000);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      this.state.temporaryWishlist = existingProductIds;
     
    
      await this.fetchProductOrderList();
    
  
    } catch (error) {
      console.error('Failed to add product to order list:', error);
      const notif = document.querySelector("#account-drawer-notif-wishlist");
      if (notif) {
        notif.style.display = "none";
      }
    }
  };
  removeProductFromOrderList = async (productIdToRemove) => {
    const productListContainer = document.getElementById('product__list');
    const updatedProductIds = Array.from(productListContainer.querySelectorAll('.wishlist_row'))
      .map(row => row.getAttribute('data-product-id'))
      .filter(productId => productId !== productIdToRemove);
    await window.refreshTokenIfNeeded();
    const currentAccountData = JSON.parse(localStorage.getItem('currentAccount'));
    const { authToken } = window.customerOrdersApp;
    
    const url = `${window.customerOrdersApp.urlProxy}api/v1/customer/product-list?email=${encodeURIComponent(currentAccountData?.email || window.String.customerEmail)}`;
    const token = 'Bearer ' + authToken;
    const productIdPayload = {
      products: updatedProductIds,
    };
    console.log('updatedProductIds', updatedProductIds);
  
    const requestOptions = {
      method: 'PUT',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productIdPayload),
    };
  
    fetch(url, requestOptions)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.text();
      })
      .then(result => {
        const productRow = productListContainer.querySelector(`[data-product-id="${productIdToRemove}"]`);
        if (productRow) {
          productRow.remove();
        }
      })
      .catch(error => console.error('Failed to remove product from order list:', error));
  }

  findMetafield = (metafields, namespace, key) => (
    metafields.find(metafield => metafield.namespace === namespace && metafield.key === key)
  );

  updateProductPrices = (pricingData) => {
    let subtotalPriceText = document.querySelector('.nf__totals--price-text');
    subtotalPriceText.innerHTML = `0,00`;
    subtotalPriceText.classList.remove('skeleton');
    pricingData.data.forEach(priceData => {
      if (priceData) {
        const priceElement = document.querySelector(`#product__list .wishlist_row[data-variant="${priceData.variantId}"] .price-box .price`);
        const priceInt = Number(priceData.price.amount);
        if (priceElement) {
          priceElement.classList.remove('skeleton');
          priceElement.textContent = `€${priceInt.toFixed(2).replace(".", ",")}`;
        }
      }
    });
  };

  updateTimesOrdered = (orderData) => {
    orderData.data.forEach(orderInfo => {
      if (orderInfo) {
        const variantId = orderInfo.variants[0].id;
        const totalOrderLineItems = Number(orderInfo.totalOrderLineItems);
        const orderElement = document.querySelector(`#product__list .wishlist_row[data-variant="${variantId}"] .times_ordered_text`);
        if (orderElement) {
          orderElement.classList.remove('skeleton');
          orderElement.textContent = `${totalOrderLineItems}`;
        }
      }
    });
  };

  initComponent() {
    this.fetchProductOrderList();
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
    let currentAccountData = JSON.parse(localStorage.getItem('currentAccount')) ?? '';
    fetch(`${window.customerOrdersApp.urlProxy}api/v1/customer/orders?email=${encodeURIComponent(currentAccountData?.email || window.String.customerEmail)}&items=${this.state.itemsPerPage}${queryParams ? `&${queryParams}` : ``}`, requestOptions)
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
      ${this.state.previousPage === null && this.state.nextPage === null ? '' : `
        <div class="pagination">
          <button id="prevPage" ${this.state.previousPage == null ? 'disabled' : ''}>${window.pageIcon}</button>
          <button id="nextPage" ${this.state.nextPage == null ? 'disabled' : ''}>${window.pageIcon}</button>
        </div>
      `}
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
    console.log('render orders', this.state.orders);
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
        <a href="/${productUrl}" class="no-decor">
          ${imageUrl ? `<div class="image-box">
          <div class="image_wrapper">
            <img style="width: 100px" src="${imageUrl}">
          </div>
        </div>` : ""}        
        </a>
      </div>
      <div class="desc-box">
        <div>
          <a href="/${productUrl}">
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
                ${item.product?.metafieldOtherPiecesPerBox ?? ""} ${window.String.pieces_per_box}
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
    </div>` : `No Product Data`}
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
          const notif = document.querySelector("#nf-add-to-cart-modal-notif");
          notif.style.display = "block";
          setTimeout(function () {
            notif.style.display = "none";
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

    const currentAccountData = JSON.parse(localStorage.getItem('currentAccount')) || {};
    const payload = {
      customer_id: currentAccountData.customerID ?? '',
      line_items: orderListData
    };
    function showSnackbar(message, isError = false) {
      var snackbar = isError ? document.getElementById("create_draft_error_snackbar") : document.getElementById("create_draft_snackbar");
      snackbar.textContent = message;
      snackbar.className = "show";
      setTimeout(function(){ snackbar.className = snackbar.className.replace("show", ""); }, 3000);
    }

    if (!payload.line_items || payload.line_items.length === 0) {
      console.error('Cart is empty or cart data not found.');
      showSnackbar('Cart is empty or cart data not found.', true);
      return;
  }

        if (currentAccountData.companyId) {
          payload.company_id = currentAccountData.companyId;
      }
      if (currentAccountData.companyName) {
          payload.company_contact_id = currentAccountData.companyContactId;
      }

      if (currentAccountData.companyLocationName) {
          payload.company_location_id = currentAccountData.companyLocationId;
      }


    const { authToken } = window.customerOrdersApp;
    const headers = new Headers({
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    });

    fetch(`${window.customerOrdersApp.urlProxy}api/v1/order/draft-b2b`, {
      body: JSON.stringify(payload),
      credentials: 'same-origin',
      headers,
      method: 'POST'
    })
      .then(response => response.json())
      .then(json => {
        createDraftOrderButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M441 58.9L453.1 71c9.4 9.4 9.4 24.6 0 33.9L424 134.1 377.9 88 407 58.9c9.4-9.4 24.6-9.4 33.9 0zM209.8 256.2L344 121.9 390.1 168 255.8 302.2c-2.9 2.9-6.5 5-10.4 6.1l-58.5 16.7 16.7-58.5c1.1-3.9 3.2-7.5 6.1-10.4zM373.1 25L175.8 222.2c-8.7 8.7-15 19.4-18.3 31.1l-28.6 100c-2.4 8.4-.1 17.4 6.1 23.6s15.2 8.5 23.6 6.1l100-28.6c11.8-3.4 22.5-9.7 31.1-18.3L487 138.9c28.1-28.1 28.1-73.7 0-101.8L474.9 25C446.8-3.1 401.2-3.1 373.1 25zM88 64C39.4 64 0 103.4 0 152V424c0 48.6 39.4 88 88 88H360c48.6 0 88-39.4 88-88V312c0-13.3-10.7-24-24-24s-24 10.7-24 24V424c0 22.1-17.9 40-40 40H88c-22.1 0-40-17.9-40-40V152c0-22.1 17.9-40 40-40H200c13.3 0 24-10.7 24-24s-10.7-24-24-24H88z"/></svg>
          Create Draft Order
        `;
        console.log('created');
        showSnackbar('Draft Order Created');
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
      content = `
          <div class="nf-loader-overlay">
            <div class="nf-spinner"></div>
          </div>
        `;
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
            ${this.state.lineItems.products !== null ? `
              <div class="nf-my-orders__table recently_ordered">
                <div class="account-product__grid">
                  ${this.renderLineItems()}
                </div>
                <div class="re-order-cta-btn--wrapper">
                  ${localStorage.getItem('currentAccount') ?
            `<button class="re-order-cta re-order-btn create-draft-order-button" style="background-color: #fbe04c;">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                        <path d="M441 58.9L453.1 71c9.4 9.4 9.4 24.6 0 33.9L424 134.1 377.9 88 407 58.9c9.4-9.4 24.6-9.4 33.9 0zM209.8 256.2L344 121.9 390.1 168 255.8 302.2c-2.9 2.9-6.5 5-10.4 6.1l-58.5 16.7 16.7-58.5c1.1-3.9 3.2-7.5 6.1-10.4zM373.1 25L175.8 222.2c-8.7 8.7-15 19.4-18.3 31.1l-28.6 100c-2.4 8.4-.1 17.4 6.1 23.6s15.2 8.5 23.6 6.1l100-28.6c11.8-3.4 22.5-9.7 31.1-18.3L487 138.9c28.1-28.1 28.1-73.7 0-101.8L474.9 25C446.8-3.1 401.2-3.1 373.1 25zM88 64C39.4 64 0 103.4 0 152V424c0 48.6 39.4 88 88 88H360c48.6 0 88-39.4 88-88V312c0-13.3-10.7-24-24-24s-24 10.7-24 24V424c0 22.1-17.9 40-40 40H88c-22.1 0-40-17.9-40-40V152c0-22.1 17.9-40 40-40H200c13.3 0 24-10.7 24-24s-10.7-24-24-24H88z"/>
                      </svg>
                      Create Draft Order
                    </button>` :
            `<button class="re-order-cta re-order-btn add-to-cart-button">
                      ${window.String.reOrderSelectedItems}
                    </button>`
          }
                </div>
              </div>
            ` : 'No Product Data'}
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