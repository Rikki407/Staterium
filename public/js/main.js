/* ===================================================================
 * Hola - Main JS
 *
 * ------------------------------------------------------------------- */

(($ => {
    const cfg = {
            scrollDuration: 800, // smoothscroll duration
            mailChimpURL: '' // mailchimp url
        };

    const $WIN = $(window);

    // Add the User Agent to the <html>
    // will be used for IE10 detection (Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0))
    const doc = document.documentElement;
    doc.setAttribute('data-useragent', navigator.userAgent);

    /* Preloader
     * -------------------------------------------------- */
    const ssPreloader = () => {
        $('html').addClass('ss-preload');

        $WIN.on('load', () => {
            // force page scroll position to top at page refresh
            // $('html, body').animate({ scrollTop: 0 }, 'normal');

            // will first fade out the loading animation
            $('#loader').fadeOut('slow', () => {
                // will fade out the whole DIV that covers the website.
                $('#preloader')
                    .delay(300)
                    .fadeOut('slow');
            });

            // for hero content animations
            $('html').removeClass('ss-preload');
            $('html').addClass('ss-loaded');
        });
    };

    /* pretty print
     * -------------------------------------------------- */
    const ssPrettyPrint = () => {
        $('pre').addClass('prettyprint');
        $(document).ready(() => {
            prettyPrint();
        });
    };

    /* Move header
     * -------------------------------------------------- */
    const ssMoveHeader = () => {
        const hero = $('.page-hero');
        const hdr = $('header');
        const triggerHeight = hero.outerHeight() - 170;

        $WIN.on('scroll', () => {
            const loc = $WIN.scrollTop();

            if (loc > triggerHeight) {
                hdr.addClass('sticky');
            } else {
                hdr.removeClass('sticky');
            }

            if (loc > triggerHeight + 20) {
                hdr.addClass('offset');
            } else {
                hdr.removeClass('offset');
            }

            if (loc > triggerHeight + 150) {
                hdr.addClass('scrolling');
            } else {
                hdr.removeClass('scrolling');
            }
        });

        // $WIN.on('resize', function() {
        //     if ($WIN.width() <= 768) {
        //             hdr.removeClass('sticky offset scrolling');
        //     }
        // });
    };

    /* Mobile Menu
     * ---------------------------------------------------- */

    const ssMobileMenu = () => {
        const toggleButton = $('.header-menu-toggle');
        const nav = $('.header-nav-wrap');

        toggleButton.on('click', event => {
            event.preventDefault();

            toggleButton.toggleClass('is-clicked');
            nav.slideToggle();
        });

        if (toggleButton.is(':visible')) nav.addClass('mobile');

        $WIN.on('resize', () => {
            if (toggleButton.is(':visible')) nav.addClass('mobile');
            else nav.removeClass('mobile');
        });

        nav.find('a').on('click', () => {
            if (nav.hasClass('mobile')) {
                toggleButton.toggleClass('is-clicked');
                nav.slideToggle();
            }
        });
    };

    /* Masonry
     * ---------------------------------------------------- */

    const ssMasonryFolio = () => {
        const containerBricks = $('.masonry');

        containerBricks.imagesLoaded(() => {
            containerBricks.masonry({
                itemSelector: '.masonry__brick',
                resize: true
            });
        });
    };

    /* photoswipe
     * ----------------------------------------------------- */
    const ssPhotoswipe = () => {
        const items = [];
        const $pswp = $('.pswp')[0];
        const $folioItems = $('.item-folio');

        // get items
        $folioItems.each(function(i) {
            const $folio = $(this);
            const $thumbLink = $folio.find('.thumb-link');
            const $title = $folio.find('.item-folio__title');
            const $caption = $folio.find('.item-folio__caption');
            const $titleText = `<h4>${$.trim($title.html())}</h4>`;
            const $captionText = $.trim($caption.html());
            const $href = $thumbLink.attr('href');
            const $size = $thumbLink.data('size').split('x');
            const $width = $size[0];
            const $height = $size[1];

            const item = {
                src: $href,
                w: $width,
                h: $height
            };

            if ($caption.length > 0) {
                item.title = $.trim($titleText + $captionText);
            }

            items.push(item);
        });

        // bind click event
        $folioItems.each(function(i) {
            $(this).on('click', e => {
                e.preventDefault();
                const options = {
                    index: i,
                    showHideOpacity: true
                };

                // initialize PhotoSwipe
                const lightBox = new PhotoSwipe(
                    $pswp,
                    PhotoSwipeUI_Default,
                    items,
                    options
                );
                lightBox.init();
            });
        });
    };

    /* slick slider
     * ------------------------------------------------------ */
    const ssSlickSlider = () => {
        $('.testimonials__slider').slick({
            arrows: true,
            dots: false,
            infinite: true,
            slidesToShow: 2,
            slidesToScroll: 1,
            prevArrow:
                "<div class='slick-prev'><i class='im im-arrow-left' aria-hidden='true'></i></div>",
            nextArrow:
                "<div class='slick-next'><i class='im im-arrow-right' aria-hidden='true'></i></div>",
            pauseOnFocus: false,
            autoplaySpeed: 1500,
            responsive: [
                {
                    breakpoint: 900,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1
                    }
                }
            ]
        });
    };

    /* Highlight the current section in the navigation bar
     * ------------------------------------------------------ */
    const ssWaypoints = () => {
        const sections = $('.target-section');
        const navigation_links = $('.header-nav li a');

        sections.waypoint({
            handler(direction) {
                let active_section;

                active_section = $(`section#${this.element.id}`);

                if (direction === 'up')
                    active_section = active_section
                        .prevAll('.target-section')
                        .first();

                const active_link = $(
                    `.header-nav li a[href="#${active_section.attr('id')}"]`
                );

                navigation_links.parent().removeClass('current');
                active_link.parent().addClass('current');
            },

            offset: '25%'
        });
    };

    /* Stat Counter
    * ------------------------------------------------------ */
    const ssStatCount = () => {
        const statSection = $('.s-stats');
        const stats = $('.stats__count');

        statSection.waypoint({
            handler(direction) {
                if (direction === 'down') {
                    stats.each(function() {
                        const $this = $(this);

                        $({ Counter: 0 }).animate(
                            { Counter: $this.text() },
                            {
                                duration: 4000,
                                easing: 'swing',
                                step(curValue) {
                                    $this.text(Math.ceil(curValue));
                                }
                            }
                        );
                    });
                }

                // trigger once only
                this.destroy();
            },

            offset: '90%'
        });
    };

    /* Smooth Scrolling
    * ------------------------------------------------------ */
    const ssSmoothScroll = () => {
        $('.smoothscroll').on('click', function(e) {
            const target = this.hash;
            const $target = $(target);

            e.preventDefault();
            e.stopPropagation();

            $('html, body')
                .stop()
                .animate(
                    {
                        scrollTop: $target.offset().top
                    },
                    cfg.scrollDuration,
                    'swing',
                    () => {
                        window.location.hash = target;
                    }
                );
        });
    };

    /* Placeholder Plugin Settings
     * ------------------------------------------------------ */
    const ssPlaceholder = () => {
        $('input, textarea, select').placeholder();
    };

    /* Alert Boxes
     * ------------------------------------------------------ */
    const ssAlertBoxes = () => {
        $('.alert-box').on('click', '.alert-box__close', function() {
            $(this)
                .parent()
                .fadeOut(500);
        });
    };

    /* Contact Form
     * ------------------------------------------------------ */
    const ssContactForm = () => {
        /* local validation */
        $('#contactForm').validate({
            /* submit via ajax */
            submitHandler(form) {
                const sLoader = $('.submit-loader');

                $.ajax({
                    type: 'POST',
                    url: 'inc/sendEmail.php',
                    data: $(form).serialize(),
                    beforeSend() {
                        sLoader.slideDown('slow');
                    },
                    success(msg) {
                        // Message was sent
                        if (msg == 'OK') {
                            sLoader.slideUp('slow');
                            $('.message-warning').fadeOut();
                            $('#contactForm').fadeOut();
                            $('.message-success').fadeIn();
                        }
                        // There was an error
                        else {
                            sLoader.slideUp('slow');
                            $('.message-warning').html(msg);
                            $('.message-warning').slideDown('slow');
                        }
                    },
                    error() {
                        sLoader.slideUp('slow');
                        $('.message-warning').html(
                            'Something went wrong. Please try again.'
                        );
                        $('.message-warning').slideDown('slow');
                    }
                });
            }
        });
    };

    /* Back to Top
    * ------------------------------------------------------ */
    const ssBackToTop = () => {
        const // height on which the button will show
        pxShow = 500;

        const // how slow/fast you want the button to show
        fadeInTime = 400;

        const // how slow/fast you want the button to hide
        fadeOutTime = 400;

        const // how slow/fast you want the button to scroll to top. can be a value, 'slow', 'normal' or 'fast'
        scrollSpeed = 300;

        const goTopButton = $('.go-top');

        // Show or hide the sticky footer button
        $(window).on('scroll', () => {
            if ($(window).scrollTop() >= pxShow) {
                goTopButton.fadeIn(fadeInTime);
            } else {
                goTopButton.fadeOut(fadeOutTime);
            }
        });
    };

    /* Initialize
    * ------------------------------------------------------ */
    (function ssInit() {
        ssPreloader();
        ssPrettyPrint();
        ssMoveHeader();
        ssMobileMenu();
        ssMasonryFolio();
        ssPhotoswipe();
        ssSlickSlider();
        ssWaypoints();
        ssStatCount();
        ssSmoothScroll();
        ssPlaceholder();
        ssAlertBoxes();
        ssContactForm();
        ssBackToTop();
    })();
}))(jQuery);