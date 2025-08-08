function initLogoWallCycle() {
  const brands = [
    { name: "Arjo", logo: "arjo.svg" },
    { name: "Baker Hughes", logo: "bakerhughes.svg" },
    { name: "BASF", logo: "basf.svg" },
    { name: "BMW", logo: "bmw.svg" },
    { name: "Bracco", logo: "bracco.svg" },
    { name: "Carlsberg", logo: "carlsberg.svg" },
    { name: "Danfoss", logo: "danfoss.svg" },
    { name: "Demant", logo: "demant.svg" },
    { name: "Embla Medical", logo: "emblamedical.svg" },
    { name: "ForMotion", logo: "formotion.svg" },
    { name: "Generali Group", logo: "generali.svg" },
    { name: "Henkel", logo: "henkel.svg" },
    { name: "Kedrion Biopharma", logo: "kedrion.svg" },
    { name: "Maersk", logo: "maersk.svg" },
    { name: "Merck", logo: "merck.svg" },
    { name: "Meta", logo: "meta.svg" },
    { name: "Nordea", logo: "nordea.svg" },
    { name: "Novo Nordisk", logo: "novonordisk.svg" },
    { name: "Novonesis", logo: "novonesis.svg" },
    { name: "Siemens", logo: "siemens.svg" },
    { name: "Volkswagen", logo: "volkswagen.svg" },
    { name: "Össur", logo: "ossur.svg" },
  ];

  const brandBoxes = [
    ...document.querySelectorAll(
      "[data-logo-wall-target].logo-wall__logo-target"
    ),
  ];

  function addBrandNames(brands) {
    brandBoxes.forEach((brandBox, i) => {
      const brand = brands[i];
      if (!brand) return;

      brandBox.innerHTML = ""; // Clear existing content

      const logoImg = document.createElement("img");
      logoImg.src = `./logos/${brand.logo}`;
      logoImg.alt = brand.name;
      logoImg.classList.add("logo-wall__logo-img");

      const brandNameEl = document.createElement("p");
      brandNameEl.classList.add("logo-wall__logo-name");
      brandNameEl.textContent = brand.name;

      brandBox.appendChild(logoImg);
      // brandBox.appendChild(brandNameEl);
    });
  }

  addBrandNames(brands);

  const loopDelay = 1.5; // Loop Duration
  const duration = 0.9; // Animation Duration

  document.querySelectorAll("[data-logo-wall-cycle-init]").forEach((root) => {
    const list = root.querySelector("[data-logo-wall-list]");
    const items = Array.from(list.querySelectorAll("[data-logo-wall-item]"));

    const shuffleFront =
      root.getAttribute("data-logo-wall-shuffle") !== "false";
    const originalTargets = items
      .map((item) => item.querySelector("[data-logo-wall-target]"))
      .filter(Boolean);

    let visibleItems = [];
    let visibleCount = 0;
    let pool = [];
    let pattern = [];
    let patternIndex = 0;
    let tl;

    function isVisible(el) {
      return window.getComputedStyle(el).display !== "none";
    }

    function shuffleArray(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    const seenLogos = new Set();

    function setup() {
      if (tl) {
        tl.kill();
      }

      visibleItems = items.filter(isVisible);
      visibleCount = visibleItems.length;

      pattern = shuffleArray(Array.from({ length: visibleCount }, (_, i) => i));
      patternIndex = 0;

      // Remove all injected targets
      items.forEach((item) => {
        item
          .querySelectorAll("[data-logo-wall-target]")
          .forEach((old) => old.remove());
      });

      pool = originalTargets.map((n) => n.cloneNode(true));

      let front, rest;
      if (shuffleFront) {
        const shuffledAll = shuffleArray(pool);
        front = shuffledAll.slice(0, visibleCount);
        rest = shuffleArray(shuffledAll.slice(visibleCount));
      } else {
        front = pool.slice(0, visibleCount);
        rest = shuffleArray(pool.slice(visibleCount));
      }
      pool = front.concat(rest);

      for (let i = 0; i < visibleCount; i++) {
        const parent =
          visibleItems[i].querySelector("[data-logo-wall-target-parent]") ||
          visibleItems[i];
        parent.appendChild(pool.shift());
      }

      tl = gsap.timeline({ repeat: -1, repeatDelay: loopDelay });
      tl.call(swapNext);
      tl.play();
    }

    function swapNext() {
      const nowCount = items.filter(isVisible).length;
      if (nowCount !== visibleCount) {
        setup();
        return;
      }
      if (!pool.length) return;

      const idx = pattern[patternIndex % visibleCount];
      patternIndex++;

      const container = visibleItems[idx];
      const parent =
        container.querySelector("[data-logo-wall-target-parent]") ||
        container.querySelector("*:has(> [data-logo-wall-target])") ||
        container;
      const existing = parent.querySelectorAll("[data-logo-wall-target]");
      if (existing.length > 1) return;

      const current = parent.querySelector("[data-logo-wall-target]");
      const currentBrandName = current?.querySelector("img")?.alt;

      if (currentBrandName) seenLogos.add(currentBrandName);
      if (seenLogos.size === brands.length) {
        seenLogos.clear(); // Reset after all have been seen
      }

      // Find an unseen logo in the pool
      let incomingIndex = pool.findIndex(
        (el) => !seenLogos.has(el.querySelector("img")?.alt)
      );

      if (incomingIndex === -1) {
        // All logos have been seen — reset
        seenLogos.clear();
        incomingIndex = 0;
      }

      const incoming = pool.splice(incomingIndex, 1)[0];

      gsap.set(incoming, { yPercent: 50, autoAlpha: 0 });
      parent.appendChild(incoming);

      if (current) {
        gsap.to(current, {
          yPercent: -50,
          autoAlpha: 0,
          duration,
          ease: "expo.inOut",
          onComplete: () => {
            current.remove();
            pool.push(current);
          },
        });
      }

      gsap.to(incoming, {
        yPercent: 0,
        autoAlpha: 1,
        duration,
        delay: 0.1,
        ease: "expo.inOut",
      });
    }

    //   function setup() {
    //     if (tl) {
    //       tl.kill();
    //     }
    //     visibleItems = items.filter(isVisible);
    //     visibleCount = visibleItems.length;

    //     pattern = shuffleArray(Array.from({ length: visibleCount }, (_, i) => i));
    //     patternIndex = 0;

    //     // remove all injected targets
    //     items.forEach((item) => {
    //       item
    //         .querySelectorAll("[data-logo-wall-target]")
    //         .forEach((old) => old.remove());
    //     });

    //     pool = originalTargets.map((n) => n.cloneNode(true));

    //     let front, rest;
    //     if (shuffleFront) {
    //       const shuffledAll = shuffleArray(pool);
    //       front = shuffledAll.slice(0, visibleCount);
    //       rest = shuffleArray(shuffledAll.slice(visibleCount));
    //     } else {
    //       front = pool.slice(0, visibleCount);
    //       rest = shuffleArray(pool.slice(visibleCount));
    //     }
    //     pool = front.concat(rest);

    //     for (let i = 0; i < visibleCount; i++) {
    //       const parent =
    //         visibleItems[i].querySelector("[data-logo-wall-target-parent]") ||
    //         visibleItems[i];
    //       parent.appendChild(pool.shift());
    //     }

    //     tl = gsap.timeline({ repeat: -1, repeatDelay: loopDelay });
    //     tl.call(swapNext);
    //     tl.play();
    //   }

    //   const seenLogos = new Set();

    //   function swapNext() {
    //     const nowCount = items.filter(isVisible).length;
    //     if (nowCount !== visibleCount) {
    //       setup();
    //       return;
    //     }
    //     if (!pool.length) return;

    //     const idx = pattern[patternIndex % visibleCount];
    //     patternIndex++;

    //     const container = visibleItems[idx];
    //     const parent =
    //       container.querySelector("[data-logo-wall-target-parent]") ||
    //       container.querySelector("*:has(> [data-logo-wall-target])") ||
    //       container;
    //     const existing = parent.querySelectorAll("[data-logo-wall-target]");
    //     if (existing.length > 1) return;

    //     // const current = parent.querySelector("[data-logo-wall-target]");
    //     const incoming = pool.shift();

    //       const current = parent.querySelector("[data-logo-wall-target]");
    // const currentBrandName = current?.querySelector("img")?.alt;

    // if (currentBrandName) seenLogos.add(currentBrandName);
    // if (seenLogos.size === brands.length) {
    //   seenLogos.clear(); // Reset after all have been seen
    // }

    //     gsap.set(incoming, { yPercent: 50, autoAlpha: 0 });
    //     parent.appendChild(incoming);

    //     if (current) {
    //       gsap.to(current, {
    //         yPercent: -50,
    //         autoAlpha: 0,
    //         duration,
    //         ease: "expo.inOut",
    //         onComplete: () => {
    //           current.remove();
    //           pool.unshift(current);
    //         },
    //       });
    //     }

    //     gsap.to(incoming, {
    //       yPercent: 0,
    //       autoAlpha: 1,
    //       duration,
    //       delay: 0.1,
    //       ease: "expo.inOut",
    //     });
    //   }

    setup();

    ScrollTrigger.create({
      trigger: root,
      start: "top bottom",
      end: "bottom top",
      onEnter: () => tl.play(),
      onLeave: () => tl.pause(),
      onEnterBack: () => tl.play(),
      onLeaveBack: () => tl.pause(),
    });

    document.addEventListener("visibilitychange", () =>
      document.hidden ? tl.pause() : tl.play()
    );
  });
}

// Initialize Logo Wall Cycle
document.addEventListener("DOMContentLoaded", () => {
  initLogoWallCycle();
  console.log("LogoWallInitiated");
});
