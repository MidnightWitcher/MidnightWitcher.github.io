function toggleMenu(event) {
  event.preventDefault();

  const menuToggle = document.getElementById("menu-toggle");
  menuToggle.checked = !menuToggle.checked;
}

function scrollToSection(event) {
  const targetId = event.currentTarget.getAttribute("href");

  if (!targetId || !targetId.startsWith("#")) {
    return;
  }

  const target = document.querySelector(targetId);
  if (target) {
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function filterProjects(category) {
  const projectCards = document.querySelectorAll(".project-card");

  projectCards.forEach(function (card) {
    card.hidden = category !== "all" && card.dataset.category !== category;
  });

  document.querySelectorAll(".filter-button").forEach(function (button) {
    const isActive = button.dataset.category === category;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function displayProjectImage(button) {
  const lightbox = document.getElementById("project-lightbox");
  const lightboxImage = document.getElementById("lightbox-image");
  const lightboxCaption = document.getElementById("lightbox-caption");

  lightboxImage.src = button.dataset.imageSrc;
  lightboxImage.alt = button.dataset.imageAlt;
  lightboxCaption.textContent = button.dataset.imageAlt;
  lightbox.hidden = false;
  document.body.style.overflow = "hidden";
  lightbox.querySelector(".lightbox-close").focus();
}

function closeProjectImage() {
  const lightbox = document.getElementById("project-lightbox");
  const lightboxImage = document.getElementById("lightbox-image");

  lightbox.hidden = true;
  document.body.style.overflow = "";
  lightboxImage.src = "";
}

function validateContactField(field) {
  const errorElement = document.getElementById(`${field.id}-error`);
  let message = "";

  if (field.validity.valueMissing) {
    message = `${field.labels[0].textContent} is required.`;
  } else if (field.type === "email" && field.validity.typeMismatch) {
    message = "Enter a valid email address, such as name@example.com.";
  }
  field.setAttribute("aria-invalid", String(Boolean(message)));
  errorElement.textContent = message;
  return !message;
}

function validateContactForm(form) {
  const fields = [
    form.elements.name,
    form.elements.email,
    form.elements.message
  ];

  return fields.map(validateContactField).every(Boolean);
}

function setContactStatus(statusElement, message, type) {
  statusElement.textContent = message;
  statusElement.className = `form-status ${type ? `is-${type}` : ""}`.trim();
}

document.addEventListener("DOMContentLoaded", function () {
  const menuButton = document.querySelector(".menu-button");
  const navLinks = document.querySelectorAll("nav a[href^='#']");
  const filterButtons = document.querySelectorAll(".filter-button");
  const projectImages = document.querySelectorAll(".project-image-button");
  const lightbox = document.getElementById("project-lightbox");
  const lightboxClose = lightbox.querySelector(".lightbox-close");
  const contactForm = document.getElementById("contact-form");
  const contactStatus = document.getElementById("form-status");

  menuButton.addEventListener("click", toggleMenu);

  navLinks.forEach(function (link) {
    link.addEventListener("click", scrollToSection);
  });

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      filterProjects(button.dataset.category);
    });
  });

  projectImages.forEach(function (button) {
    button.addEventListener("click", function () {
      displayProjectImage(button);
    });
  });

  lightboxClose.addEventListener("click", closeProjectImage);
  lightbox.addEventListener("click", function (event) {
    if (event.target === lightbox) {
      closeProjectImage();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !lightbox.hidden) {
      closeProjectImage();
    }
  });

  contactForm.querySelectorAll("input, textarea").forEach(function (field) {
    field.addEventListener("blur", function () {
      validateContactField(field);
    });

    field.addEventListener("input", function () {
      if (field.getAttribute("aria-invalid") === "true") {
        validateContactField(field);
      }
    });
  });

  contactForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!validateContactForm(contactForm)) {
      setContactStatus(contactStatus, "Please correct the highlighted fields.", "error");
      contactForm.querySelector('[aria-invalid="true"]').focus();
      return;
    }

    const apiEndpoint = contactForm.dataset.apiEndpoint;
    const submitButton = contactForm.querySelector("button[type='submit']");
    const formData = new FormData(contactForm);

    if (apiEndpoint) {
      submitButton.disabled = true;
      setContactStatus(contactStatus, "Sending your message…", "");

      try {
        const response = await fetch(apiEndpoint, {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json"
          }
        });

        if (!response.ok) {
          throw new Error(`Submission failed with status ${response.status}.`);
        }

        event.currentTarget.reset();
        contactForm.querySelectorAll("input, textarea").forEach(function (field) {
          field.setAttribute("aria-invalid", "false");
          document.getElementById(`${field.id}-error`).textContent = "";
        });
        setContactStatus(contactStatus, "Your message was sent successfully. Thank you!", "success");
      } catch (error) {
        setContactStatus(
          contactStatus,
          "We could not send your message. Please try again later or contact us directly.",
          "error"
        );
        console.error("Contact form submission failed:", error);
      } finally {
        submitButton.disabled = false;
      }
      return;
    }

    event.currentTarget.reset();
    contactForm.querySelectorAll("input, textarea").forEach(function (field) {
      field.setAttribute("aria-invalid", "false");
      document.getElementById(`${field.id}-error`).textContent = "";
    });
    setContactStatus(contactStatus, "Your message was received. Thank you!", "success");
  });
});
