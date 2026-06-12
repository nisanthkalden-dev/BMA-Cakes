// ============================
// BMA CAKES - Admin JavaScript
// ============================

var allCakes = [];
var editImageBase64 = ""; // stores base64 from file upload in edit modal

// ============================
// DISABLE BROWSER AUTOCOMPLETE
// ============================
window.addEventListener("load", function () {
  // Force clear inputs on page load to prevent auto-fill
  setTimeout(function () {
    var emailInput = document.getElementById("email");
    var passInput = document.getElementById("password");
    if (emailInput) emailInput.value = "";
    if (passInput) passInput.value = "";
  }, 100);
});

// ============================
// AUTH STATE
// ============================
auth.onAuthStateChanged(function (user) {
  if (user) {
    document.getElementById("loginPage").style.display = "none";
    document.getElementById("adminDashboard").style.display = "flex";
    document.getElementById("userEmail").textContent = user.email;
    loadCakes();
  } else {
    document.getElementById("loginPage").style.display = "flex";
    document.getElementById("adminDashboard").style.display = "none";
  }
});

// ============================
// LOGIN
// ============================
function login() {
  var email = document.getElementById("email").value.trim();
  var password = document.getElementById("password").value.trim();
  var errorEl = document.getElementById("loginError");
  var btn = document.getElementById("loginBtn");

  if (!email || !password) {
    errorEl.textContent = "Please enter email and password";
    return;
  }

  btn.classList.add("loading");
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
  errorEl.textContent = "";

  auth.signInWithEmailAndPassword(email, password)
    .then(function () {
      showToast("Login successful!");
    })
    .catch(function (err) {
      errorEl.textContent = err.message;
      btn.classList.remove("loading");
      btn.innerHTML = '<span>Sign In</span><i class="fas fa-arrow-right"></i>';
    });
}

document.getElementById("password").addEventListener("keypress", function (e) {
  if (e.key === "Enter") login();
});

function logout() {
  auth.signOut().then(function () {
    showToast("Logged out");
  });
}

function togglePassword() {
  var input = document.getElementById("password");
  var icon = document.getElementById("eyeIcon");
  if (input.type === "password") {
    input.type = "text";
    icon.className = "fas fa-eye-slash";
  } else {
    input.type = "password";
    icon.className = "fas fa-eye";
  }
}

// ============================
// SIDEBAR NAVIGATION
// ============================
document.querySelectorAll(".sidebar-link[data-tab]").forEach(function (link) {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    var tab = link.getAttribute("data-tab");

    document.querySelectorAll(".sidebar-link").forEach(function (l) { l.classList.remove("active"); });
    link.classList.add("active");

    document.querySelectorAll(".tab-content").forEach(function (t) { t.classList.remove("active"); });
    document.getElementById("tab-" + tab).classList.add("active");

    var titles = { overview: "Dashboard Overview", addCake: "Add New Cake", manageCakes: "Manage Cakes" };
    document.getElementById("pageTitle").textContent = titles[tab] || "Dashboard";

    document.querySelector(".sidebar").classList.remove("open");
  });
});

document.getElementById("sidebarToggle").addEventListener("click", function () {
  document.querySelector(".sidebar").classList.toggle("open");
});

// ============================
// ADD CAKE - IMAGE UPLOAD / PREVIEW
// ============================
var imageUploadArea = document.getElementById("imageUploadArea");
var cakeImageInput = document.getElementById("cakeImage");

imageUploadArea.addEventListener("click", function () { cakeImageInput.click(); });

cakeImageInput.addEventListener("change", function () {
  var file = this.files[0];
  if (file) {
    var reader = new FileReader();
    reader.onload = function (e) {
      document.getElementById("imagePreview").src = e.target.result;
      document.getElementById("imagePreview").style.display = "block";
      document.getElementById("uploadPlaceholder").style.display = "none";
      document.getElementById("cakeImageUrl").value = "";
    };
    reader.readAsDataURL(file);
  }
});

document.getElementById("cakeImageUrl").addEventListener("input", function () {
  var url = this.value.trim();
  if (url) {
    document.getElementById("imagePreview").src = url;
    document.getElementById("imagePreview").style.display = "block";
    document.getElementById("uploadPlaceholder").style.display = "none";
    document.getElementById("cakeImage").value = "";
  } else {
    document.getElementById("imagePreview").style.display = "none";
    document.getElementById("uploadPlaceholder").style.display = "";
  }
});

// ============================
// CONVERT IMAGE FILE TO BASE64
// ============================
function fileToBase64(file) {
  return new Promise(function (resolve, reject) {
    var reader = new FileReader();
    reader.onload = function () { resolve(reader.result); };
    reader.onerror = function () { reject(reader.error); };
    reader.readAsDataURL(file);
  });
}

// ============================
// ADD CAKE
// ============================
function addCake() {
  var name = document.getElementById("cakeName").value.trim();
  var price = document.getElementById("cakePrice").value.trim();
  var category = document.getElementById("cakeCategory").value;
  var description = document.getElementById("cakeDescription").value.trim();
  var imageUrl = document.getElementById("cakeImageUrl").value.trim();
  var imageFile = document.getElementById("cakeImage").files[0];

  if (!name || !price) {
    showToast("Please enter cake name and price");
    return;
  }

  var btn = document.getElementById("addCakeBtn");
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
  btn.disabled = true;

  var cakeData = {
    name: name,
    price: Number(price),
    category: category,
    description: description || "Delicious handcrafted cake",
    image: imageUrl || "",
    timestamp: Date.now()
  };

  if (imageFile && !imageUrl) {
    fileToBase64(imageFile).then(function (base64) {
      cakeData.image = base64;
      return saveCakeToFirestore(cakeData, btn);
    }).catch(function (err) {
      console.error("Image convert error:", err);
      saveCakeToFirestore(cakeData, btn);
    });
  } else {
    saveCakeToFirestore(cakeData, btn);
  }
}

function saveCakeToFirestore(cakeData, btn) {
  return db.collection("cakes").add(cakeData)
    .then(function () {
      resetAddForm(btn);
      showToast("Cake added successfully!");
    })
    .catch(function (err) {
      console.error("Firestore error:", err);
      showToast("Error: " + err.message);
      btn.innerHTML = '<i class="fas fa-plus"></i> Add Cake';
      btn.disabled = false;
    });
}

function resetAddForm(btn) {
  document.getElementById("cakeName").value = "";
  document.getElementById("cakePrice").value = "";
  document.getElementById("cakeDescription").value = "";
  document.getElementById("cakeImageUrl").value = "";
  document.getElementById("cakeImage").value = "";
  document.getElementById("imagePreview").style.display = "none";
  document.getElementById("uploadPlaceholder").style.display = "";
  document.getElementById("cakeCategory").value = "classic";
  btn.innerHTML = '<i class="fas fa-plus"></i> Add Cake';
  btn.disabled = false;
}

// ============================
// LOAD CAKES
// ============================
function loadCakes() {
  db.collection("cakes").onSnapshot(function (snapshot) {
    allCakes = [];
    snapshot.forEach(function (doc) {
      allCakes.push({ id: doc.id, ...doc.data() });
    });
    allCakes.sort(function (a, b) {
      return (b.timestamp || 0) - (a.timestamp || 0);
    });
    renderAdminCakes(allCakes);
    renderOverview(allCakes);
  }, function (err) {
    console.error("Load cakes error:", err);
    showToast("Error loading cakes: " + err.message);
  });
}

function renderOverview(cakes) {
  document.getElementById("totalCakes").textContent = cakes.length;
  var cats = new Set(cakes.map(function (c) { return c.category || "classic"; }));
  document.getElementById("totalCategories").textContent = cats.size;
  var avg = cakes.length ? Math.round(cakes.reduce(function (s, c) { return s + Number(c.price || 0); }, 0) / cakes.length) : 0;
  document.getElementById("avgPrice").textContent = "\u20B9" + avg;

  var list = document.getElementById("overviewCakeList");
  if (cakes.length === 0) {
    list.innerHTML = '<p style="color:var(--gray); text-align:center; padding:30px;">No cakes yet. Add your first cake!</p>';
    return;
  }

  list.innerHTML = cakes.map(function (cake) {
    var thumb = cake.image
      ? '<img src="' + escapeHtml(cake.image) + '" alt="' + escapeHtml(cake.name) + '">'
      : '<i class="fas fa-birthday-cake"></i>';
    return '<div class="overview-cake-item">' +
      '<div class="overview-cake-thumb">' + thumb + '</div>' +
      '<div class="overview-cake-info">' +
        '<h4>' + escapeHtml(cake.name) + '</h4>' +
        '<p>\u20B9' + cake.price + '</p>' +
        '<span>' + escapeHtml(cake.category || "classic") + '</span>' +
      '</div>' +
    '</div>';
  }).join("");
}

function renderAdminCakes(cakes) {
  var grid = document.getElementById("adminCakeList");

  if (cakes.length === 0) {
    grid.innerHTML = '<p style="color:var(--gray); text-align:center; padding:30px; grid-column:1/-1;">No cakes found.</p>';
    return;
  }

  grid.innerHTML = "";

  cakes.forEach(function (cake) {
    var card = document.createElement("div");
    card.className = "admin-cake-card";
    card.setAttribute("data-name", cake.name.toLowerCase());

    var imgHtml = cake.image
      ? '<img src="' + escapeHtml(cake.image) + '" alt="' + escapeHtml(cake.name) + '" loading="lazy">'
      : '<i class="fas fa-birthday-cake no-img"></i>';

    card.innerHTML =
      '<div class="admin-cake-img">' + imgHtml + '</div>' +
      '<div class="admin-cake-body">' +
        '<h4>' + escapeHtml(cake.name) + '</h4>' +
        '<div class="cake-meta">' +
          '<span class="cake-price">\u20B9' + cake.price + '</span>' +
          '<span class="cake-cat">' + escapeHtml(cake.category || "classic") + '</span>' +
        '</div>' +
        '<p class="cake-desc">' + escapeHtml(cake.description || "") + '</p>' +
        '<div class="admin-cake-actions">' +
          '<button class="btn-edit"><i class="fas fa-edit"></i> Edit</button>' +
          '<button class="btn-delete"><i class="fas fa-trash"></i> Delete</button>' +
        '</div>' +
      '</div>';

    card.querySelector(".btn-edit").addEventListener("click", function () {
      openEditModal(cake.id);
    });
    card.querySelector(".btn-delete").addEventListener("click", function () {
      deleteCake(cake.id, cake.name);
    });

    grid.appendChild(card);
  });
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
// SEARCH / FILTER
// ============================
function filterCakes() {
  var query = document.getElementById("searchCakes").value.toLowerCase();
  var cards = document.querySelectorAll(".admin-cake-card");
  cards.forEach(function (card) {
    var name = card.getAttribute("data-name");
    card.style.display = name.includes(query) ? "" : "none";
  });
}

// ============================
// EDIT MODAL
// ============================
function openEditModal(id) {
  var cake = allCakes.find(function (c) { return c.id === id; });
  if (!cake) return;

  // Reset file state
  editImageBase64 = "";
  document.getElementById("editImageFile").value = "";

  document.getElementById("editId").value = id;
  document.getElementById("editName").value = cake.name;
  document.getElementById("editPrice").value = cake.price;
  document.getElementById("editCategory").value = cake.category || "classic";
  document.getElementById("editDescription").value = cake.description || "";
  document.getElementById("editImage").value = cake.image || "";

  var preview = document.getElementById("editImagePreview");
  if (cake.image) {
    preview.src = cake.image;
    preview.style.display = "block";
  } else {
    preview.style.display = "none";
  }

  document.getElementById("editModal").style.display = "flex";
}

// Edit modal - "Choose from Computer" button
document.getElementById("editUploadBtn").addEventListener("click", function () {
  document.getElementById("editImageFile").click();
});

// Edit modal - file selected from system
document.getElementById("editImageFile").addEventListener("change", function () {
  var file = this.files[0];
  if (file) {
    var reader = new FileReader();
    reader.onload = function (e) {
      editImageBase64 = e.target.result;
      document.getElementById("editImagePreview").src = editImageBase64;
      document.getElementById("editImagePreview").style.display = "block";
      // Clear URL input since file is chosen
      document.getElementById("editImage").value = "";
    };
    reader.readAsDataURL(file);
  }
});

// Edit modal - URL input change
document.getElementById("editImage").addEventListener("input", function () {
  var preview = document.getElementById("editImagePreview");
  if (this.value.trim()) {
    preview.src = this.value.trim();
    preview.style.display = "block";
    // Clear file state since URL is entered
    editImageBase64 = "";
    document.getElementById("editImageFile").value = "";
  } else {
    preview.style.display = "none";
  }
});

function closeModal() {
  document.getElementById("editModal").style.display = "none";
  editImageBase64 = "";
}

function saveEdit() {
  var id = document.getElementById("editId").value;
  var name = document.getElementById("editName").value.trim();
  var price = document.getElementById("editPrice").value.trim();
  var category = document.getElementById("editCategory").value;
  var description = document.getElementById("editDescription").value.trim();
  var imageUrl = document.getElementById("editImage").value.trim();

  if (!name || !price) {
    showToast("Name and price are required");
    return;
  }

  // Use base64 from file upload if available, otherwise use URL
  var finalImage = editImageBase64 || imageUrl;

  db.collection("cakes").doc(id).update({
    name: name,
    price: Number(price),
    category: category,
    description: description,
    image: finalImage
  }).then(function () {
    closeModal();
    showToast("Cake updated!");
  }).catch(function (err) {
    console.error(err);
    showToast("Error: " + err.message);
  });
}

// ============================
// DELETE CAKE
// ============================
function deleteCake(id, name) {
  if (!confirm('Delete "' + name + '"? This cannot be undone.')) return;

  db.collection("cakes").doc(id).delete()
    .then(function () { showToast("Cake deleted"); })
    .catch(function (err) {
      console.error(err);
      showToast("Error: " + err.message);
    });
}

// ============================
// TOAST
// ============================
function showToast(message) {
  var toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(function () { toast.classList.remove("show"); }, 2500);
}
