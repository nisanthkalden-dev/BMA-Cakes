// ============================
// BMA CAKES - Main JavaScript
// ============================

var PHONE = "919342440948";

// ============================
// PRELOADER
// ============================
window.addEventListener("load", function () {
  setTimeout(function () {
    document.getElementById("preloader").classList.add("hidden");
  }, 1500);
});
 
// ============================
// WHATSAPP ORDER
// ============================
function orderWhatsApp(message) {
  var url = "https://wa.me/" + PHONE + "?text=" + encodeURIComponent(message);
  window.open(url, "_blank");
}

// ============================
// MOBILE MENU
// ============================
var mobileToggle = document.getElementById("mobileToggle");
var navMenu = document.getElementById("navMenu");

mobileToggle.addEventListener("click", function () {
  navMenu.classList.toggle("open");
  mobileToggle.classList.toggle("active");
});

navMenu.querySelectorAll("a").forEach(function (link) {
  link.addEventListener("click", function () {
    navMenu.classList.remove("open");
    mobileToggle.classList.remove("active");
  });
});

// ============================
// SMOOTH SCROLL
// ============================
document.querySelectorAll('a[href^="#"]').forEach(function (link) {
  link.addEventListener("click", function (e) {
    var targetId = this.getAttribute("href");
    if (targetId === "#") return;
    e.preventDefault();
    var target = document.querySelector(targetId);
    if (target) {
      var offset = 80;
      var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: top, behavior: "smooth" });
    }
  });
});

// ============================
// NAVBAR SCROLL EFFECT
// ============================
var navbarEl = document.getElementById("navbar");
var backToTop = document.getElementById("backToTop");

window.addEventListener("scroll", function () {
  if (window.scrollY > 50) {
    navbarEl.classList.add("scrolled");
  } else {
    navbarEl.classList.remove("scrolled");
  }

  if (window.scrollY > 500) {
    backToTop.classList.add("visible");
  } else {
    backToTop.classList.remove("visible");
  }

  updateActiveNav();
});

backToTop.addEventListener("click", function () {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// ============================
// ACTIVE NAV LINK
// ============================
function updateActiveNav() {
  var sections = document.querySelectorAll("section[id]");
  var navLinks = document.querySelectorAll(".navbar nav a");
  var current = "";

  sections.forEach(function (section) {
    var sectionTop = section.offsetTop - 120;
    if (window.scrollY >= sectionTop) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach(function (link) {
    link.classList.remove("active");
    if (link.getAttribute("href") === "#" + current) {
      link.classList.add("active");
    }
  });
}

// ============================
// COUNTER ANIMATION
// ============================
function animateCounters() {
  var counters = document.querySelectorAll(".stat-num");
  counters.forEach(function (counter) {
    var target = Number(counter.getAttribute("data-target"));
    var duration = 2000;
    var step = target / (duration / 16);
    var current = 0;

    function update() {
      current += step;
      if (current < target) {
        counter.textContent = Math.floor(current);
        requestAnimationFrame(update);
      } else {
        counter.textContent = target;
      }
    }
    update();
  });
}

var heroObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      animateCounters();
      heroObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

var heroSection = document.querySelector(".hero");
if (heroSection) heroObserver.observe(heroSection);

// ============================
// SCROLL REVEAL
// ============================
var revealObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add("show", "visible");
    }
  });
}, { threshold: 0.1 });

function observeRevealElements() {
  document.querySelectorAll(".menu-card, .gallery-item, .testimonial-card, .contact-card, .feature, .reveal").forEach(function (el) {
    revealObserver.observe(el);
  });
}
observeRevealElements();

// ============================
// CART SYSTEM
// ============================
var cart = JSON.parse(localStorage.getItem("bma_cart")) || [];

function saveCart() {
  localStorage.setItem("bma_cart", JSON.stringify(cart));
}

function updateCartUI() {
  var countEl = document.getElementById("cartCount");
  var itemsEl = document.getElementById("cartItems");
  var footerEl = document.getElementById("cartFooter");
  var totalEl = document.getElementById("cartTotal");

  var totalItems = cart.reduce(function (sum, item) { return sum + item.qty; }, 0);
  countEl.textContent = totalItems;

  if (cart.length === 0) {
    itemsEl.innerHTML =
      '<div class="cart-empty">' +
        '<i class="fas fa-shopping-basket"></i>' +
        '<p>Your cart is empty</p>' +
      '</div>';
    footerEl.style.display = "none";
    return;
  }

  footerEl.style.display = "block";
  var total = 0;

  itemsEl.innerHTML = "";
  cart.forEach(function (item, i) {
    total += item.price * item.qty;

    var cartItem = document.createElement("div");
    cartItem.className = "cart-item";

    var iconDiv = document.createElement("div");
    iconDiv.className = "cart-item-icon";
    if (item.image) {
      var img = document.createElement("img");
      img.src = item.image;
      img.alt = item.name;
      iconDiv.appendChild(img);
    } else {
      iconDiv.innerHTML = '<i class="fas fa-birthday-cake"></i>';
    }

    cartItem.innerHTML =
      '<div class="cart-item-details">' +
        '<h4>' + escapeHtml(item.name) + '</h4>' +
        '<span class="cart-item-price">\u20B9' + item.price + '</span>' +
      '</div>';

    var qtyDiv = document.createElement("div");
    qtyDiv.className = "cart-item-qty";

    var minusBtn = document.createElement("button");
    minusBtn.textContent = "-";
    minusBtn.addEventListener("click", (function (idx) {
      return function () { changeQty(idx, -1); };
    })(i));

    var qtySpan = document.createElement("span");
    qtySpan.textContent = item.qty;

    var plusBtn = document.createElement("button");
    plusBtn.textContent = "+";
    plusBtn.addEventListener("click", (function (idx) {
      return function () { changeQty(idx, 1); };
    })(i));

    qtyDiv.appendChild(minusBtn);
    qtyDiv.appendChild(qtySpan);
    qtyDiv.appendChild(plusBtn);

    cartItem.insertBefore(iconDiv, cartItem.firstChild);
    cartItem.appendChild(qtyDiv);

    itemsEl.appendChild(cartItem);
  });

  totalEl.textContent = "\u20B9" + total;
}

function addToCart(name, price, image) {
  var existing = cart.find(function (item) { return item.name === name; });
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ name: name, price: Number(price), qty: 1, image: image || "" });
  }
  saveCart();
  updateCartUI();
  showToast(name + " added to cart!");
}

function changeQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
  }
  saveCart();
  updateCartUI();
}

function clearCart() {
  cart = [];
  saveCart();
  updateCartUI();
}

function checkout() {
  if (cart.length === 0) return;
  var msg = "Hello! I want to order:\n\n";
  var total = 0;
  cart.forEach(function (item) {
    msg += item.name + " x" + item.qty + " - \u20B9" + (item.price * item.qty) + "\n";
    total += item.price * item.qty;
  });
  msg += "\nTotal: \u20B9" + total + "\n\nPlease confirm availability and delivery.";
  orderWhatsApp(msg);
}

document.getElementById("cartBtn").addEventListener("click", function () {
  document.getElementById("cartSidebar").classList.add("open");
  document.getElementById("cartOverlay").classList.add("open");
});

document.getElementById("cartClose").addEventListener("click", closeCartSidebar);
document.getElementById("cartOverlay").addEventListener("click", closeCartSidebar);
document.getElementById("checkoutBtn").addEventListener("click", checkout);
document.getElementById("clearCartBtn").addEventListener("click", clearCart);

function closeCartSidebar() {
  document.getElementById("cartSidebar").classList.remove("open");
  document.getElementById("cartOverlay").classList.remove("open");
}

updateCartUI();

// ============================
// TOAST NOTIFICATION
// ============================
function showToast(message) {
  var toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(function () { toast.classList.remove("show"); }, 2500);
}

// ============================
// HELPER: Escape HTML
// ============================
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ============================
// LOAD MENU FROM FIREBASE (FIXED)
// ============================
function loadMenu() {
  var list = document.getElementById("cakeList");

  db.collection("cakes").onSnapshot(function (snapshot) {
    // Clear the menu
    list.innerHTML = "";

    if (snapshot.empty) {
      list.innerHTML =
        '<div style="grid-column: 1/-1; text-align:center; padding:40px; color:var(--gray);">' +
          '<i class="fas fa-birthday-cake" style="font-size:3rem; color:rgba(255,215,0,0.3); margin-bottom:15px; display:block;"></i>' +
          '<p>Menu coming soon! Contact us on WhatsApp for orders.</p>' +
        '</div>';
      return;
    }

    snapshot.forEach(function (doc) {
      var cake = doc.data();
      var imageUrl = cake.image || "";
      var category = cake.category || "classic";
      var description = cake.description || "Delicious handcrafted cake";
      var cakeName = cake.name || "Cake";
      var cakePrice = cake.price || 0;

      // Create card element
      var card = document.createElement("div");
      card.className = "menu-card";
      card.setAttribute("data-category", category);

      // Build image section
      var imageDiv = document.createElement("div");
      imageDiv.className = "menu-card-image";

      if (imageUrl) {
        var img = document.createElement("img");
        img.src = imageUrl;
        img.alt = cakeName;
        img.loading = "lazy";
        img.onerror = function () {
          this.style.display = "none";
          var placeholder = document.createElement("div");
          placeholder.className = "menu-card-placeholder";
          placeholder.innerHTML = '<i class="fas fa-birthday-cake"></i>';
          this.parentNode.appendChild(placeholder);
        };
        imageDiv.appendChild(img);
      } else {
        var placeholder = document.createElement("div");
        placeholder.className = "menu-card-placeholder";
        placeholder.innerHTML = '<i class="fas fa-birthday-cake"></i>';
        imageDiv.appendChild(placeholder);
      }

      var badge = document.createElement("span");
      badge.className = "card-badge";
      badge.textContent = category.charAt(0).toUpperCase() + category.slice(1);
      imageDiv.appendChild(badge);

      // Build body section
      var bodyDiv = document.createElement("div");
      bodyDiv.className = "menu-card-body";

      var h3 = document.createElement("h3");
      h3.textContent = cakeName;

      var descP = document.createElement("p");
      descP.className = "cake-desc";
      descP.textContent = description;

      var footerDiv = document.createElement("div");
      footerDiv.className = "menu-card-footer";

      var priceSpan = document.createElement("span");
      priceSpan.className = "price";
      priceSpan.textContent = "\u20B9" + cakePrice;

      var actionsDiv = document.createElement("div");
      actionsDiv.className = "menu-card-actions";

      // Add to cart button
      var cartBtn = document.createElement("button");
      cartBtn.className = "btn-cart";
      cartBtn.innerHTML = '<i class="fas fa-cart-plus"></i> Add';
      cartBtn.addEventListener("click", (function (n, p, im) {
        return function (e) { e.stopPropagation(); addToCart(n, p, im); };
      })(cakeName, cakePrice, imageUrl));

      // WhatsApp order button
      var orderBtn = document.createElement("button");
      orderBtn.className = "btn-order";
      orderBtn.innerHTML = '<i class="fab fa-whatsapp"></i>';
      orderBtn.addEventListener("click", (function (n, p) {
        return function (e) { e.stopPropagation(); orderCake(n, p); };
      })(cakeName, cakePrice));

      actionsDiv.appendChild(cartBtn);
      actionsDiv.appendChild(orderBtn);
      footerDiv.appendChild(priceSpan);
      footerDiv.appendChild(actionsDiv);

      bodyDiv.appendChild(h3);
      bodyDiv.appendChild(descP);
      bodyDiv.appendChild(footerDiv);

      card.appendChild(imageDiv);
      card.appendChild(bodyDiv);

      // Click card to open popup
      card.style.cursor = "pointer";
      card.addEventListener("click", (function (n, p, im, cat, desc) {
        return function () { openCakePopup(n, p, im, cat, desc); };
      })(cakeName, cakePrice, imageUrl, category, description));

      list.appendChild(card);

      // Trigger animation after append
      setTimeout(function () { card.classList.add("show"); }, 50);
    });

    // Re-observe for scroll animations
    observeRevealElements();

  }, function (err) {
    console.error("Menu load error:", err);
    list.innerHTML =
      '<div style="grid-column: 1/-1; text-align:center; padding:40px; color:#ff4d6d;">' +
        '<i class="fas fa-exclamation-triangle" style="font-size:2rem; margin-bottom:10px; display:block;"></i>' +
        '<p>Error loading menu. Please refresh the page.</p>' +
        '<p style="font-size:0.8rem; margin-top:5px;">' + err.message + '</p>' +
      '</div>';
  });
}

loadMenu();

// ============================
// ORDER SINGLE CAKE
// ============================
function orderCake(name, price) {
  var message = "Hello!\nI want to order:\n\nCake: " + name + "\nPrice: \u20B9" + price + "\n\nPlease confirm availability.";
  orderWhatsApp(message);
}

// ============================
// CAKE DETAIL POPUP
// ============================
var popupOverlay = document.getElementById("cakePopupOverlay");
var popupClose = document.getElementById("cakePopupClose");

function openCakePopup(name, price, image, category, description) {
  // Image
  var imgContainer = document.getElementById("cakePopupImage");
  if (image) {
    imgContainer.innerHTML = '<img src="' + image + '" alt="' + escapeHtml(name) + '">';
  } else {
    imgContainer.innerHTML = '<i class="fas fa-birthday-cake popup-placeholder"></i>';
  }

  // Details
  document.getElementById("cakePopupName").textContent = name;
  document.getElementById("cakePopupDesc").textContent = description;
  document.getElementById("cakePopupPrice").textContent = "\u20B9" + price;
  document.getElementById("cakePopupCategory").textContent = (category || "classic").charAt(0).toUpperCase() + (category || "classic").slice(1);

  // Wire up action buttons
  var cartBtnPopup = document.getElementById("cakePopupCart");
  var orderBtnPopup = document.getElementById("cakePopupOrder");

  // Remove old listeners by cloning
  var newCartBtn = cartBtnPopup.cloneNode(true);
  cartBtnPopup.parentNode.replaceChild(newCartBtn, cartBtnPopup);
  newCartBtn.addEventListener("click", function () {
    addToCart(name, price, image);
    closeCakePopup();
  });

  var newOrderBtn = orderBtnPopup.cloneNode(true);
  orderBtnPopup.parentNode.replaceChild(newOrderBtn, orderBtnPopup);
  newOrderBtn.addEventListener("click", function () {
    orderCake(name, price);
  });

  // Open
  popupOverlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeCakePopup() {
  popupOverlay.classList.remove("open");
  document.body.style.overflow = "";
}

popupClose.addEventListener("click", closeCakePopup);
popupOverlay.addEventListener("click", function (e) {
  if (e.target === popupOverlay) closeCakePopup();
});

// Close popup with Escape key
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") closeCakePopup();
});

// ============================
// CATEGORY FILTER
// ============================
document.querySelectorAll(".filter-btn").forEach(function (btn) {
  btn.addEventListener("click", function () {
    document.querySelectorAll(".filter-btn").forEach(function (b) { b.classList.remove("active"); });
    btn.classList.add("active");

    var filter = btn.getAttribute("data-filter");
    document.querySelectorAll(".menu-card").forEach(function (card) {
      if (filter === "all" || card.getAttribute("data-category") === filter) {
        card.style.display = "";
      } else {
        card.style.display = "none";
      }
    });
  });
});
