const openInvitation = document.getElementById("openInvitation");
const scrapbook = document.getElementById("scrapbook");

window.addEventListener("pageshow", () => {
    document.body.classList.add("page-ready");
    document.body.classList.remove("page-leaving");
});

window.addEventListener("DOMContentLoaded", () => {
    requestAnimationFrame(() => {
        document.body.classList.add("page-ready");
    });

    if (window.location.hash === "#scrapbook" && scrapbook) {
        document.body.classList.add("site-open");
        openInvitation?.classList.add("open");
    }

    document.querySelectorAll("a[href]").forEach((link) => {
        const href = link.getAttribute("href");

        if (!href || href.startsWith("#") || href.startsWith("http") || link.target === "_blank" || link.hasAttribute("download")) {
            return;
        }

        link.addEventListener("click", (event) => {
            event.preventDefault();
            document.body.classList.add("page-leaving");
            const isBackLink = link.classList.contains("back-link");

            if (isBackLink) {
                link.classList.add("is-returning");
            }

            window.setTimeout(() => {
                window.location.href = href;
            }, isBackLink ? 560 : 260);
        });
    });

    const revealItems = document.querySelectorAll(".reveal-on-scroll");

    if ("IntersectionObserver" in window && revealItems.length) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.18,
            rootMargin: "0px 0px -40px 0px"
        });

        revealItems.forEach((item, index) => {
            item.style.transitionDelay = `${Math.min(index * 60, 360)}ms`;
            observer.observe(item);
        });
    } else {
        revealItems.forEach((item) => item.classList.add("is-visible"));
    }

    const countdown = document.getElementById("countdownTimer");

    if (countdown) {
        const targetDate = new Date(countdown.dataset.weddingDate);
        const daysEl = countdown.querySelector('[data-unit="days"]');
        const hoursEl = countdown.querySelector('[data-unit="hours"]');
        const minutesEl = countdown.querySelector('[data-unit="minutes"]');
        const secondsEl = countdown.querySelector('[data-unit="seconds"]');

        const updateCountdown = () => {
            const now = new Date();
            const diff = targetDate - now;

            if (diff <= 0) {
                if (daysEl) daysEl.textContent = "00";
                if (hoursEl) hoursEl.textContent = "00";
                if (minutesEl) minutesEl.textContent = "00";
                if (secondsEl) secondsEl.textContent = "00";
                return;
            }

            const totalSeconds = Math.floor(diff / 1000);
            const days = Math.floor(totalSeconds / 86400);
            const hours = Math.floor((totalSeconds % 86400) / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            if (daysEl) daysEl.textContent = String(days).padStart(2, "0");
            if (hoursEl) hoursEl.textContent = String(hours).padStart(2, "0");
            if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, "0");
            if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, "0");
        };

        updateCountdown();
        window.setInterval(updateCountdown, 1000);
    }

    const attendanceInputs = document.querySelectorAll('input[name="attendance"]');
    const guestCountField = document.getElementById("guestCountField");

    if (attendanceInputs.length && guestCountField) {
        const syncAttendance = () => {
            const selected = document.querySelector('input[name="attendance"]:checked');
            const isAttending = selected?.value === "Attending";
            guestCountField.classList.toggle("is-hidden", !isAttending);
        };

        attendanceInputs.forEach((input) => {
            input.addEventListener("change", syncAttendance);
        });

        syncAttendance();
    }

    const rsvpForm = document.getElementById("customRsvpForm");
    const rsvpStatus = document.getElementById("rsvpStatus");
    const rsvpSubmitButton = document.getElementById("rsvpSubmitButton");

    if (rsvpForm && rsvpStatus && rsvpSubmitButton) {
        rsvpForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const scriptUrl = rsvpForm.dataset.scriptUrl;

            if (!scriptUrl || scriptUrl.includes("PASTE_YOUR_GOOGLE_APPS_SCRIPT_URL_HERE")) {
                rsvpStatus.textContent = "Add your Google Apps Script URL first so this form can send to Google Sheets.";
                rsvpStatus.classList.add("is-error");
                return;
            }

            rsvpStatus.textContent = "Sending your RSVP...";
            rsvpStatus.classList.remove("is-error");
            rsvpSubmitButton.disabled = true;

            const formData = new FormData(rsvpForm);
            const payload = Object.fromEntries(formData.entries());

            if (payload.attendance !== "Attending") {
                payload.guest_count = "0";
            }

            try {
                const body = new URLSearchParams();
                Object.entries(payload).forEach(([key, value]) => {
                    body.append(key, value);
                });

                await fetch(scriptUrl, {
                    method: "POST",
                    mode: "no-cors",
                    body
                });

                rsvpForm.reset();
                const firstAttendance = rsvpForm.querySelector('input[name="attendance"][value="Attending"]');
                if (firstAttendance) {
                    firstAttendance.checked = true;
                }
                guestCountField?.classList.remove("is-hidden");
                rsvpStatus.textContent = "Thank you. Your RSVP was sent successfully.";
                rsvpStatus.classList.remove("is-error");
            } catch (error) {
                rsvpStatus.textContent = "Sorry, your RSVP could not be sent yet. Please try again after the Google Sheets link is connected.";
                rsvpStatus.classList.add("is-error");
            } finally {
                rsvpSubmitButton.disabled = false;
            }
        });
    }
});

if (openInvitation && scrapbook) {
    openInvitation.addEventListener("click", () => {
        const isOpen = openInvitation.classList.contains("open");

        if (isOpen) {
            openInvitation.classList.remove("open");
            document.body.classList.remove("site-open");

            window.setTimeout(() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
            }, 120);

            return;
        }

        openInvitation.classList.add("open");
        document.body.classList.add("site-open");

        window.setTimeout(() => {
            scrapbook.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 1180);
    });
}
