const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a");
const sections = document.querySelectorAll("main section[id]");
const revealItems = document.querySelectorAll(".reveal");
const particleField = document.querySelector(".particle-field");
const contactForm = document.getElementById("contact-form");

function closeMenu() {
  if (!siteNav || !navToggle) {
    return;
  }

  siteNav.classList.remove("is-open");
  document.body.classList.remove("nav-open");
  navToggle.setAttribute("aria-expanded", "false");
}

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    document.body.classList.toggle("nav-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
}

if (particleField) {
  const particleCount = window.matchMedia("(max-width: 680px)").matches ? 22 : 42;

  for (let index = 0; index < particleCount; index += 1) {
    const particle = document.createElement("span");
    particle.className = "particle";
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    particle.style.setProperty("--duration", `${4 + Math.random() * 6}s`);
    particle.style.animationDelay = `${Math.random() * 4}s`;
    particleField.appendChild(particle);
  }
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.16,
    rootMargin: "0px 0px -60px 0px",
  }
);

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index * 35, 240)}ms`;
  revealObserver.observe(item);
});

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      navLinks.forEach((link) => link.classList.remove("active"));
      const activeLink = document.querySelector(`.site-nav a[href="#${entry.target.id}"]`);

      if (activeLink) {
        activeLink.classList.add("active");
      }
    });
  },
  {
    rootMargin: "-38% 0px -48% 0px",
    threshold: 0,
  }
);

sections.forEach((section) => {
  navObserver.observe(section);
});

document.querySelectorAll(".portal-card, .project-card, .skill-card").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  });
});

// --- EmailJS Integration ---
// Replace these with your actual IDs from the EmailJS Dashboard
const EMAILJS_PUBLIC_KEY = "h-HuBSZqFViGB4Aut"; 
const EMAILJS_SERVICE_ID = "service_mujge91";
const EMAILJS_NOTIFY_TEMPLATE_ID = "template_8atqtdk";
const EMAILJS_AUTOREPLY_TEMPLATE_ID = "template_zxdoz5n";

if (typeof emailjs !== "undefined") {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

const formStatus = document.getElementById("form-status");

if (contactForm && formStatus) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    // 1. Honeypot check (security)
    const honeypot = contactForm.querySelector('input[name="honeypot"]').value;
    if (honeypot) {
      console.warn("Spam detected.");
      contactForm.reset();
      return; // Silent fail for bots
    }
    
    const submitBtn = contactForm.querySelector("button[type='submit']");
    const originalBtnText = submitBtn.textContent;
    
    // 2. Basic Validation & Sanitization
    const formData = new FormData(contactForm);
    const email = formData.get("reply_to").trim();
    const message = formData.get("message").trim();

    if (!email || !message) {
      formStatus.textContent = "Please fill in all required fields.";
      formStatus.className = "form-status error";
      return;
    }
    
    // Set Loading State
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";
    formStatus.style.display = "none";
    formStatus.className = "form-status";

    // Send both emails simultaneously
    Promise.all([
      emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_NOTIFY_TEMPLATE_ID, contactForm),
      emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_AUTOREPLY_TEMPLATE_ID, contactForm)
    ])
      .then(() => {
        // Success State
        formStatus.textContent = "Thanks! Your message has been sent, and a confirmation email is on its way to you.";
        formStatus.classList.add("success");
        contactForm.reset();
      })
      .catch((error) => {
        // Error State
        console.error("EmailJS Error:", error);
        formStatus.textContent = "Oops! Something went wrong. Please check your internet and try again.";
        formStatus.classList.add("error");
      })
      .finally(() => {
        // Reset Button
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      });
  });
}


// Interactive Infinite Carousel Logic
const carousel = document.querySelector(".projects-carousel");
const track = document.querySelector(".projects-track");

if (carousel && track) {
  let isDown = false;
  let startX;
  let scrollLeft;
  let isPaused = false;
  const scrollSpeed = 0.8;
  let animationId;
  let currentScroll = 0;

  const getHalfWidth = () => track.scrollWidth / 2;

  const autoScroll = () => {
    if (!isPaused && !isDown) {
      currentScroll += scrollSpeed;
      const halfWidth = getHalfWidth();
      if (currentScroll >= halfWidth) {
        currentScroll -= halfWidth;
      }
      carousel.scrollLeft = currentScroll;
    } else {
      currentScroll = carousel.scrollLeft;
    }
    animationId = requestAnimationFrame(autoScroll);
  };

  animationId = requestAnimationFrame(autoScroll);

  carousel.addEventListener("mouseenter", () => {
    isPaused = true;
  });

  carousel.addEventListener("mouseleave", () => {
    if (!isDown) isPaused = false;
    isDown = false;
    carousel.classList.remove("is-dragging");
  });

  carousel.addEventListener("mousedown", (e) => {
    isDown = true;
    isPaused = true;
    carousel.classList.add("is-dragging");
    startX = e.pageX - carousel.offsetLeft;
    scrollLeft = carousel.scrollLeft;
  });

  window.addEventListener("mouseup", () => {
    if (isDown) {
      isDown = false;
      isPaused = false;
      carousel.classList.remove("is-dragging");
    }
  });

  carousel.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - carousel.offsetLeft;
    const walk = (x - startX) * 2;
    carousel.scrollLeft = scrollLeft - walk;
    currentScroll = carousel.scrollLeft;

    const halfWidth = getHalfWidth();
    if (carousel.scrollLeft >= halfWidth) {
      carousel.scrollLeft -= halfWidth;
      scrollLeft -= halfWidth;
      currentScroll = carousel.scrollLeft;
    } else if (carousel.scrollLeft <= 0) {
      carousel.scrollLeft += halfWidth;
      scrollLeft += halfWidth;
      currentScroll = carousel.scrollLeft;
    }
  });

  carousel.addEventListener("wheel", (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      carousel.scrollLeft += e.deltaY;
      currentScroll = carousel.scrollLeft;

      const halfWidth = getHalfWidth();
      if (carousel.scrollLeft >= halfWidth) {
        carousel.scrollLeft -= halfWidth;
        currentScroll = carousel.scrollLeft;
      } else if (carousel.scrollLeft <= 0) {
        carousel.scrollLeft += halfWidth;
        currentScroll = carousel.scrollLeft;
      }
    }
  }, { passive: false });

  carousel.addEventListener("touchstart", () => {
    isPaused = true;
  }, { passive: true });

  carousel.addEventListener("touchend", () => {
    setTimeout(() => { 
      if (!isDown) isPaused = false; 
    }, 2000);
  }, { passive: true });
}
