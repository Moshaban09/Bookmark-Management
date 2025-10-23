// ===== DOM ELEMENT REFERENCES =====
let websiteName = document.getElementById("websiteName");
let websiteUrl = document.getElementById("websiteUrl");
let submitBtn = document.getElementById("submitBtn");
let bookmarkContainer = document.getElementById("bookmarkContainer");
let modal = document.querySelector(".modal");
let closeBtn = document.getElementById("closeBtn");

let bookmarks = [];
let editIndex = null;

// Load bookmarks from localStorage on page load
if (localStorage.getItem("bookmarksList")) {
  bookmarks = JSON.parse(localStorage.getItem("bookmarksList"));
  displayBookmarks();
}

// Submit button click handler
submitBtn.addEventListener("click", () => {
  if (validateForm(true)) {
    if (editIndex !== null) {
      updateBookmark();
    } else {
      addBookmark();
    }
  }
});

// Enter key support for form submission
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    if (validateForm(true)) {
      if (editIndex !== null) {
        updateBookmark();
      } else {
        addBookmark();
      }
    }
  }
});

// Modal close handlers
closeBtn.addEventListener("click", () => {
  modal.classList.add("d-none");
});

modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.add("d-none");
  }
});

// Escape key to close modal
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    modal.classList.add("d-none");
  }
});

// Real-time form validation
websiteName.addEventListener("input", () => validateForm(false));
websiteUrl.addEventListener("input", () => validateForm(false));

// ===== CORE FUNCTIONS =====
/**
 * Adds a new bookmark to the list after validation
 */
function addBookmark() {
  let url = websiteUrl.value.trim();

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }

  let bookmark = {
    websiteName: capitalize(websiteName.value.trim()),
    websiteUrl: url,
  };

  bookmarks.push(bookmark);
  localStorage.setItem("bookmarksList", JSON.stringify(bookmarks));
  displayBookmarks();
  clearInputs();
}

//  Displays all bookmarks in the container

function displayBookmarks() {
  if (bookmarks.length === 0) {
    bookmarkContainer.innerHTML = `
      <div class="text-center py-5 text-secondary">
        <div class="d-inline-flex flex-column align-items-center justify-content-center p-4" style="max-width: 400px;">
          <i class="fa-regular fa-bookmark fa-3x mb-3 text-primary"></i>
          <h5 class="fw-semibold mb-2">No bookmarks yet</h5>
          <p class="mb-0 small text-muted">Add your first bookmark to get started!</p>
        </div>
      </div>
    `;
    return;
  }

  let newBookmark = "";

  for (let i = 0; i < bookmarks.length; i++) {
    newBookmark += generateBookmarkHTML(bookmarks[i], i);
  }

  bookmarkContainer.innerHTML = newBookmark;
}

// Validates the bookmark form inputs

function validateForm(showModal) {
  let nameValue = websiteName.value.trim();
  let urlValue = websiteUrl.value.trim();

  let patterns = {
    websiteName: /^[A-Za-z0-9 \u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]{3,}$/,
    websiteUrl: /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/\S*)?$/,
  };

  let validName = patterns.websiteName.test(nameValue);
  let validUrl = patterns.websiteUrl.test(urlValue);

  if (!validName || !validUrl) {
    if (showModal) modal.classList.remove("d-none");
    return false;
  } else {
    modal.classList.add("d-none");
    return true;
  }
}

// ===== DOMAIN SUGGESTION FEATURE =====
let domainList = document.getElementById("domainList");
let domainButtons = domainList.getElementsByTagName("button");

// Domain suggestion based on URL input
websiteUrl.addEventListener("input", () => {
  let value = websiteUrl.value.trim();
  let dotIndex = value.lastIndexOf(".");

  if (value) {
    domainList.classList.remove("d-none");
  } else {
    domainList.classList.add("d-none");
    return;
  }

  if (dotIndex === -1) {
    for (let i = 0; i < domainButtons.length; i++) {
      domainButtons[i].classList.remove("d-none");
    }
    return;
  }

  let afterDot = value.slice(dotIndex + 1).toLowerCase();

  for (let i = 0; i < domainButtons.length; i++) {
    let btn = domainButtons[i];
    let domain = btn.innerText.slice(1).toLowerCase();
    if (domain.startsWith(afterDot)) {
      btn.classList.remove("d-none");
    } else {
      btn.classList.add("d-none");
    }
  }
});

// Domain button click handlers
for (let i = 0; i < domainButtons.length; i++) {
  domainButtons[i].addEventListener("click", function () {
    let value = websiteUrl.value.trim();
    let lastDotIndex = value.lastIndexOf(".");
    if (lastDotIndex !== -1) {
      value = value.slice(0, lastDotIndex);
    }
    websiteUrl.value = value + this.innerText;
    domainList.classList.add("d-none");
  });
}

websiteUrl.addEventListener("blur", () => {
  setTimeout(() => domainList.classList.add("d-none"), 100);
});

// ===== BOOKMARK MANAGEMENT FUNCTIONS =====
function editBookmark(index) {
  let bookmark = bookmarks[index];
  websiteName.value = bookmark.websiteName;
  websiteUrl.value = bookmark.websiteUrl;
  submitBtn.textContent = "Update";
  submitBtn.classList.remove("text-bg-success");
  submitBtn.classList.add("btn-warning");
  editIndex = index;
}

function updateBookmark() {
  let url = websiteUrl.value.trim();
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }

  bookmarks[editIndex] = {
    websiteName: capitalize(websiteName.value.trim()),
    websiteUrl: url,
  };

  localStorage.setItem("bookmarksList", JSON.stringify(bookmarks));
  displayBookmarks();
  clearInputs();

  submitBtn.textContent = "Submit";
  submitBtn.classList.remove("btn-warning");
  submitBtn.classList.add("text-bg-success");
  editIndex = null;
}

// ===== SEARCH FUNCTIONALITY =====
let searchInput = document.getElementById("searchInput");

searchInput.addEventListener("input", function () {
  let query = searchInput.value.toLowerCase().trim();

  let filtered = bookmarks.filter((bookmark) =>
    bookmark.websiteName.toLowerCase().includes(query)
  );

  displayFilteredBookmarks(filtered);
});

function displayFilteredBookmarks(list) {
  if (list.length === 0) {
    bookmarkContainer.innerHTML = `
      <div class="text-center py-4 text-secondary">
        <h5>No matching bookmarks found</h5>
      </div>`;
    return;
  }

  let bookmarkList = "";
  for (let i = 0; i < list.length; i++) {
    let originalIndex = bookmarks.indexOf(list[i]);
    bookmarkList += generateBookmarkHTML(list[i], originalIndex);
  }

  bookmarkContainer.innerHTML = bookmarkList;
}

// ===== UTILITY FUNCTIONS =====
function clearInputs() {
  websiteName.value = "";
  websiteUrl.value = "";
}

function capitalize(str) {
  if (!str) return "";
  return str[0].toUpperCase() + str.slice(1);
}

function deleteBookmark(i) {
  bookmarks.splice(i, 1);
  localStorage.setItem("bookmarksList", JSON.stringify(bookmarks));
  displayBookmarks();
}

//  Generator for bookmark HTML
function generateBookmarkHTML(bookmark, originalIndex) {
  return `
    <div class="bookmark-row d-flex text-center align-items-center py-2 border-bottom">
      <div class="col-2"><h6 class="mb-0">${originalIndex + 1}</h6></div>
      <div class="col-3"><h6 class="mb-0">${bookmark.websiteName}</h6></div>
      <div class="col-2">
        <a href="${
          bookmark.websiteUrl
        }" target="_blank" class="btn btn-sm px-3 text-bg-success">
          <i class="fa-solid fa-eye pe-2"></i>Visit
        </a>
      </div>
      <div class="col-2">
        <button class="btn btn-sm btn-warning px-2 text-white" onclick="editBookmark(${originalIndex})">
          <i class="fa-solid fa-pen-to-square"></i> Edit
        </button>
      </div>
      <div class="col-3">
        <button class="btn btn-sm btn-danger px-2" onclick="deleteBookmark(${originalIndex})">
          <i class="fa-solid fa-trash-can"></i> Delete
        </button>
      </div>
    </div>`;
}
