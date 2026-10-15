/* North Star Bakery - Touchstone 4
   Interactive favorites, form validation, and localStorage */

const productCatalog = [
  { id: "fresh-bread", name: "Fresh Bread Assortment" },
  { id: "signature-loaf", name: "Signature Loaf" },
  { id: "pastries", name: "Pastries and Sweets" },
  { id: "cakes", name: "Cakes and Celebrations" }
];

const storageKeys = {
  favorites: "northStarFavorites",
  customer: "northStarCustomer"
};

let favorites = loadFavorites();

function loadFavorites() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKeys.favorites));
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    return [];
  }
}

function saveFavorites() {
  localStorage.setItem(storageKeys.favorites, JSON.stringify(favorites));
}

function getProduct(productId) {
  return productCatalog.find((product) => product.id === productId);
}

function toggleFavorite(productId) {
  if (favorites.includes(productId)) {
    favorites = favorites.filter((id) => id !== productId);
  } else {
    favorites.push(productId);
  }

  saveFavorites();
  renderFavorites(false);
}

function renderFavorites(restoredFromStorage) {
  const favoritesList = document.querySelector("#favorites-list");
  const status = document.querySelector("#favorites-status");
  const clearButton = document.querySelector("#clear-favorites");
  const favoriteButtons = document.querySelectorAll(".favorite-button");

  favoriteButtons.forEach((button) => {
    const saved = favorites.includes(button.dataset.productId);
    button.textContent = saved ? "Saved - Remove" : "Save to Favorites";
    button.setAttribute("aria-pressed", String(saved));
  });

  if (!favoritesList || !status) {
    return;
  }

  favoritesList.replaceChildren();

  favorites.forEach((productId) => {
    const product = getProduct(productId);
    if (!product) {
      return;
    }

    const item = document.createElement("li");
    item.textContent = product.name;
    favoritesList.appendChild(item);
  });

  if (favorites.length === 0) {
    status.textContent = "Choose an item above to save it for later.";
  } else if (restoredFromStorage) {
    status.textContent = `Loaded ${favorites.length} saved favorite${favorites.length === 1 ? "" : "s"} from your last visit.`;
  } else {
    status.textContent = `${favorites.length} favorite${favorites.length === 1 ? "" : "s"} saved. Your list will still be here after you refresh or return later.`;
  }

  if (clearButton) {
    clearButton.disabled = favorites.length === 0;
  }
}

function setupFavoritesFeature() {
  const buttons = document.querySelectorAll(".favorite-button");
  const clearButton = document.querySelector("#clear-favorites");

  if (buttons.length === 0) {
    return;
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => toggleFavorite(button.dataset.productId));
  });

  clearButton?.addEventListener("click", () => {
    favorites = [];
    saveFavorites();
    renderFavorites(false);
  });

  renderFavorites(favorites.length > 0);
}

function loadCustomerProfile() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKeys.customer));
    return saved && typeof saved === "object" ? saved : {};
  } catch (error) {
    return {};
  }
}

function saveCustomerProfile(name, email) {
  const customer = { name, email };
  localStorage.setItem(storageKeys.customer, JSON.stringify(customer));
}

function restoreCustomerProfile() {
  const nameInput = document.querySelector("#name");
  const emailInput = document.querySelector("#email");
  const profileStatus = document.querySelector("#profile-status");

  if (!nameInput || !emailInput) {
    return;
  }

  const customer = loadCustomerProfile();
  if (customer.name) {
    nameInput.value = customer.name;
  }
  if (customer.email) {
    emailInput.value = customer.email;
  }

  if ((customer.name || customer.email) && profileStatus) {
    profileStatus.textContent = "Your saved contact information was restored from your last visit.";
  }
}

function showSavedFavoritesOnContact() {
  const section = document.querySelector("#saved-favorites-section");
  const text = document.querySelector("#saved-favorites-text");
  const addButton = document.querySelector("#add-favorites-to-request");
  const details = document.querySelector("#item-details");

  if (!section || !text || favorites.length === 0) {
    return;
  }

  const names = favorites
    .map((id) => getProduct(id))
    .filter(Boolean)
    .map((product) => product.name);

  section.hidden = false;
  text.textContent = `You saved: ${names.join(", ")}.`;

  addButton?.addEventListener("click", () => {
    if (!details) {
      return;
    }

    const favoriteText = `I am interested in: ${names.join(", ")}.`;
    details.value = details.value.trim()
      ? `${details.value.trim()}\n${favoriteText}`
      : favoriteText;
    details.focus();
  });
}

function setFieldError(field, message) {
  const errorElement = document.querySelector(`#${field.id}-error`);
  field.classList.toggle("field-error", Boolean(message));
  field.setAttribute("aria-invalid", String(Boolean(message)));

  if (errorElement) {
    errorElement.textContent = message;
  }

  return !message;
}

function validateName() {
  const field = document.querySelector("#name");
  if (!field) return true;

  const value = field.value.trim();
  if (!value) {
    return setFieldError(field, "Please enter your name.");
  }
  if (value.length < 2) {
    return setFieldError(field, "Name must be at least 2 characters.");
  }
  return setFieldError(field, "");
}

function validateEmail() {
  const field = document.querySelector("#email");
  if (!field) return true;

  const value = field.value.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!value) {
    return setFieldError(field, "Please enter your email address.");
  }
  if (!emailPattern.test(value)) {
    return setFieldError(field, "Enter an email in a format like name@example.com.");
  }
  return setFieldError(field, "");
}

function validatePickupDate() {
  const field = document.querySelector("#pickup-date");
  if (!field) return true;

  if (!field.value) {
    return setFieldError(field, "Choose a pickup date.");
  }

  const selected = new Date(`${field.value}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (selected < today) {
    return setFieldError(field, "Pickup date cannot be in the past.");
  }
  return setFieldError(field, "");
}

function validateRequestType() {
  const field = document.querySelector("#request-type");
  if (!field) return true;
  return setFieldError(field, field.value ? "" : "Choose the type of request.");
}

function validateItemDetails() {
  const field = document.querySelector("#item-details");
  if (!field) return true;

  const value = field.value.trim();
  if (!value) {
    return setFieldError(field, "Please describe what you need from the bakery.");
  }
  if (value.length < 10) {
    return setFieldError(field, "Please provide at least 10 characters of order details.");
  }
  return setFieldError(field, "");
}

function validateForm() {
  const checks = [
    validateName(),
    validateEmail(),
    validatePickupDate(),
    validateRequestType(),
    validateItemDetails()
  ];

  return checks.every(Boolean);
}

function setupContactForm() {
  const form = document.querySelector("#contact-form");
  if (!form) {
    return;
  }

  const nameInput = document.querySelector("#name");
  const emailInput = document.querySelector("#email");
  const pickupDate = document.querySelector("#pickup-date");
  const requestType = document.querySelector("#request-type");
  const itemDetails = document.querySelector("#item-details");
  const formStatus = document.querySelector("#form-status");

  restoreCustomerProfile();
  showSavedFavoritesOnContact();

  nameInput?.addEventListener("blur", validateName);
  emailInput?.addEventListener("blur", validateEmail);
  pickupDate?.addEventListener("change", validatePickupDate);
  requestType?.addEventListener("change", validateRequestType);
  itemDetails?.addEventListener("blur", validateItemDetails);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    formStatus.textContent = "";

    if (!validateForm()) {
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      firstInvalid?.focus();
      return;
    }

    saveCustomerProfile(nameInput.value.trim(), emailInput.value.trim());
    formStatus.textContent = "Your request information looks good. North Star Bakery can now review the details and confirm the order.";
  });

  form.addEventListener("reset", () => {
    window.setTimeout(() => {
      form.querySelectorAll(".error-message").forEach((error) => {
        error.textContent = "";
      });
      form.querySelectorAll(".field-error").forEach((field) => {
        field.classList.remove("field-error");
        field.setAttribute("aria-invalid", "false");
      });
      formStatus.textContent = "";
    }, 0);
  });
}

setupFavoritesFeature();
setupContactForm();
