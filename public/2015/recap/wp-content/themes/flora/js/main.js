/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
(function ($) {
  'use strict';

  window.$ = $;
  /*****************************************
     String Extension
     /*****************************************/
  $.extend(String, {
    format() {
      if (arguments.length === 0) {
        return null;
      }
      let args;
      if (arguments.length === 1) {
        args = arguments[0];
      } else {
        args = arguments;
      }
      let result = args[0];
      for (let i = 1; i < args.length; i++) {
        const re = new RegExp('\\{' + (i - 1) + '\\}', 'gm');
        result = result.replace(re, args[i]);
      }
      return result;
    }
  });

  /*****************************************
     Utilities
     /*****************************************/
  $.extend(window, {
    getUrlVars(url) {
      if (!url) {
        url = window.location.href;
      }
      let vars = [],
        params;
      if (window.location.href.indexOf('?') != -1) {
        const queries = url.slice(window.location.href.indexOf('?') + 1).split('&');
        for (let i = 0; i < queries.length; i++) {
          params = queries[i].split('=');
          vars.push(params[0]);
          vars[params[0]] = params[1] ? params[1] : '';
        }
      }
      return vars;
    }
  });

  /*****************************************
     Wyde Core
     /******************************************/
  $.extend(window, {
    wyde: {
      init() {
        this.version = '1.2.1';
        this.browser = {};
        this.detectBrowser();
        Modernizr.addTest('boxsizing', function () {
          return Modernizr.testAllProps('boxSizing') && (document.documentMode === undefined || document.documentMode > 7);
        });
      },
      detectBrowser() {
        this.browser.touch = Modernizr.touch ? true : false;
        this.browser.css3 = Modernizr.csstransforms3d ? true : false;
        const self = this;
        const getBrowserScreenSize = function () {
          const w = $(window).width();
          self.browser.xs = w < 768;
          self.browser.sm = w > 767 && w < 992;
          self.browser.md = w > 991 && w < 1200;
          self.browser.lg = w > 1199;
        };
        getBrowserScreenSize();
        const ua = window.navigator.userAgent;
        const msie = ua.indexOf('MSIE ');

        // IE 10 or older
        if (msie > 0) {
          this.browser.msie = parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
        }

        // IE 11
        const trident = ua.indexOf('Trident/');
        if (trident > 0) {
          const rv = ua.indexOf('rv:');
          this.browser.msie = parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
        }

        // IE 12
        const edge = ua.indexOf('Edge/');
        if (edge > 0) {
          this.browser.msie = parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
        }
        this.browser.prefix = '';
        if (this.browser.css3 === true) {
          const styles = window.getComputedStyle(document.documentElement, '');
          this.browser.prefix = '-' + (Array.prototype.slice.call(styles).join('').match(/-(moz|webkit|ms)-/) || styles.OLink === '' && ['', 'o'])[1] + '-';
        }
        $(window).on('resize', wydeDebounce(function () {
          getBrowserScreenSize();
        }));
      }
    }
  });
  wyde.init();

  /*****************************************
     Wyde Scroller
     /*****************************************/
  /**
   * Scroller
   *
   * @since 1.0.0
   *
   * @param {Element}  element  Target element.
   * @param {Object}   options  Options for the function.
   * @param {Function} callback Callback function.
   */
  function WydeScroller(element, options, callback) {
    const defaults = {
      height: null,
      scrollbar: false,
      onScroll: null
    };
    const settings = $.extend({}, defaults, options || {});

    // decorate the element with a scrollbar
    let $el = $(element),
      elementHeight = settings.height,
      scrollbarActive = false;
    if (!elementHeight) {
      elementHeight = $el.height();
    }
    $el.addClass('w-scroller');
    $el.wrapInner('<div class="w-scroll-area"><div class="w-content-inner"></div></div>');
    const $scrollarea = $el.find('.w-scroll-area').css({
      height: elementHeight
    });
    const $contentWrapper = $el.find('.w-content-inner');
    let contentHeight = $contentWrapper.outerHeight(true),
      ratio = Math.min(1, elementHeight / contentHeight);
    scrollbarActive = ratio < 1;
    if (settings.scrollbar) {
      $el.toggleClass('active', scrollbarActive);

      // Create scrollbars
      var $scrollbar = $('<div class="w-scrollbar"></div>').css({
        height: elementHeight
      }).appendTo($el);
      var $scrollbarbutton = $('<div class="w-bar"></div>').css({
        height: elementHeight * ratio
      }).appendTo($scrollbar);
    }
    this.toggleActiveMode = function () {
      contentHeight = $contentWrapper.outerHeight(true), ratio = Math.min(1, elementHeight / contentHeight);
      scrollbarActive = ratio < 1;
      if (settings.scrollbar) {
        $scrollbar.css('height', elementHeight);
        $el.toggleClass('active', scrollbarActive);
        if (scrollbarActive) {
          $scrollbarbutton.css('height', elementHeight * ratio);
        }
      }
    };
    this.refresh = function (height) {
      const self = this;
      setTimeout(function () {
        elementHeight = height ? height : $el.height();
        $scrollarea.css({
          height: elementHeight
        });
        self.toggleActiveMode();
      }, 100);
    };
    this.destroy = function () {
      $(window).off('resize.wyde.scroller');
      $scrollarea.off('scroll.wyde.scroller');
      $el.off('scroll.wyde.scroller');
      $contentWrapper.contents().unwrap();
    };
    $el.on('scroll.wyde.scroller', wydeDebounce(function () {
      $el.scrollLeft(0).scrollTop(0); // Issue with webkit: http://stackoverflow.com/q/10036044
    }));
    $scrollarea.on('scroll.wyde.scroller', wydeDebounce(function (event) {
      if (scrollbarActive) {
        var scrollTop = $scrollarea.scrollTop() * ratio;
        if (settings.scrollbar) {
          $scrollbarbutton.css({
            transform: 'translateY(' + scrollTop + 'px)',
            height: elementHeight * ratio
          });
        }
      }
      if (null !== settings.onScroll && typeof settings.onScroll === 'function') {
        settings.onScroll.call(event, scrollTop);
      }
    }));
    const self = this;
    $(window).on('resize.wyde.scroller', wydeDebounce(function () {
      self.refresh();
    }));
  }

  /**
   * jQuery - Wyde Scroller
   *
   * @since 1.0.0
   *
   * @param {Object}   options  Options for the function.
   * @param {Function} callback Callback function.
   * @return {Object} jQuery function.
   */
  $.fn.wydeScroller = function (options, callback) {
    let method, methodArgs;

    // Attributes logic
    if (!$.isPlainObject(options)) {
      if (typeof options === 'string' || false === options) {
        method = false === options ? 'destroy' : options;
        methodArgs = Array.prototype.slice.call(arguments, 1);
      }
      options = {};
    }

    // Apply to all elements
    return this.each(function (i, element) {
      // Call with prevention against multiple instantiations
      let plugin = $.data(element, 'WydeScroller');
      if (!plugin && !method) {
        // Create a new object if it doesn't exist yet
        plugin = $.data(element, 'WydeScroller', new WydeScroller(element, options, callback));
      } else if (plugin && method) {
        // Call method
        if (plugin[method]) {
          plugin[method].apply(plugin, methodArgs);
        }
      }
    });
  };

  /**
   * @param element
   * @param options
   * @param callback
   * @param element
   * @param options
   * @param callback
   * @param element
   * @param options
   * @param callback
   */
  function WydeVerticalMenu(element, options, callback) {
    const defaults = {
      singleOpen: true,
      changed() {}
    };
    const settings = $.extend({}, defaults, options || {});
    const $el = $(element);
    const self = this;
    this.menuSelected = function (menuItems) {
      if (settings.singleOpen) {
        const openItems = menuItems.add(menuItems.parents('.menu-item-has-children'));
        $el.find('.menu-open').not(openItems).removeClass('menu-open').find('> ul').slideUp(100);
      }
      if ($(menuItems).hasClass('menu-open')) {
        $(menuItems).removeClass('menu-open').find('> ul').slideUp(100, function () {
          settings.changed($el);
        });
      } else {
        $(menuItems).addClass('menu-open').find('> ul').slideDown(100, function () {
          settings.changed($el);
        });
      }
    };
    this.refresh = function () {
      $el.find('.vertical-menu li.menu-item-has-children').each(function () {
        const $menu = $(this);
        const $sub = $menu.find('> ul');
        if ($sub.length > 0) {
          $menu.find('> a').on('click', function (event) {
            if ('#' === $(this).attr('href') || this.pathname === window.location.pathname) {
              event.preventDefault();
              self.menuSelected($menu);
              return false;
            }
            return true;
          });
          $menu.find('> .sub-menu-button').on('click', function () {
            self.menuSelected($menu);
            return false;
          });
        }
      });
      setTimeout(function () {
        self.openSubMenu();
      }, 500);
    };
    this.openSubMenu = function () {
      // Select sub menu item
      const $selectedItems = $el.find('.current-menu-item').parents('.menu-item-has-children');
      if (!$selectedItems.length) {
        return 0;
      }
      self.menuSelected($selectedItems);
      return $selectedItems.length;
    };
    this.refresh();
  }

  /**
   * jQuery - Wyde Vertical Menu
   *
   * @since 1.0.0
   * @param {Object}   options     Options for the function.
   * @param            callbackMap
   * @param {Function} callback    Callback function.
   * @return {Object} jQuery function.
   */
  $.fn.wydeVerticalMenu = function (options, callbackMap) {
    let method, methodArgs;

    // Attributes logic
    if (!$.isPlainObject(options)) {
      if (typeof options === 'string' || options === false) {
        method = options === false ? 'destroy' : options;
        methodArgs = Array.prototype.slice.call(arguments, 1);
      }
      options = {};
    }

    // Apply to all elements
    return this.each(function (i, element) {
      // Call with prevention against multiple instantiations
      let plugin = $.data(element, 'wydeVerticalMenu');
      if (!plugin && !method) {
        // Create a new object if it doesn't exist yet
        plugin = $.data(element, 'wydeVerticalMenu', new WydeVerticalMenu(element, options, callbackMap));
      } else if (plugin && method) {
        // Call method
        if (plugin[method]) {
          plugin[method].apply(plugin, methodArgs);
        }
      }
    });
  };

  /*****************************************
     Wyde Page
     /*****************************************/
  $.extend(wyde, {
    page: {
      init() {
        this.id = this.getPageId();
        this.isHome = $('body').hasClass('home');
        this.onePage = $('body').hasClass('onepage');
        if (typeof page_settings !== 'undefined') {
          $.extend(this, page_settings);
        }
        this.createPreloader();
        this.showLoader();
        this.initMenu();
        this.improveScrolling();
        this.ready = false;
        const self = this;
        $(window).on('wyde.page.beforechange', function () {
          /* Save Expand Navigation State */
          //self.expandNavActive = $("body.expand-nav").hasClass("full-nav-active");
          self.hideSlidingBar();
          self.hideSearch();
          self.hideNav();
          self.hideFullScreenNav();
          $('body').addClass('changing');
        });
        $(window).on('wyde.page.pageloaded', function () {
          self.load();
        });
        $(window).on('wyde.page.ready', function () {
          $('body').removeClass('changing');
          self.ready = true;
        });
        $(window).on('wyde.page.statechange', function () {
          self.stateChange();
        });
        $(window).on('scroll', function (event) {
          if ($(document.body).hasClass('side-nav-active') || $(document.body).hasClass('full-nav-active')) {
            event.preventDefault();
            return false;
          }
          self.scrolled(event);
        });
        $(window).on('resize', wydeDebounce(function (event) {
          self.resize(event);
        }));
        this.preloadImages(function () {
          if (self.ready === true) {
            self.contentLoad();
            $(window).trigger('wyde.page.ready');
          } else {
            self.load();
          }
        });
        $(document).ready(function () {
          if (self.ready === true) {
            self.contentLoad();
            $(window).trigger('wyde.page.ready');
          } else {
            self.load();
          }
        });
        if (this.ajax_page) {
          this.ajaxPage();
        }
        if (this.ajax_search) {
          this.ajaxSearch();
        }
      },
      getPageId() {
        let bodyClasses = $('body').attr('class').split(' ');
        bodyClasses = $.grep(bodyClasses, function (n, i) {
          return n && n.indexOf('page-id-') > -1;
        });
        let id = '';
        if (bodyClasses.length > 0 && bodyClasses[0]) {
          id = bodyClasses[0].replace(/^\D+/g, '');
        }
        return id;
      },
      createPreloader() {
        this.preloader = $('#preloader');
        if (!this.preloader.length) {}
      },
      showLoader() {
        if (!this.preloader.length) {
          return false;
        }
        this.preloader.show();
        $('body').removeClass('loaded').addClass('loading');
        return true;
      },
      hideLoader() {
        if (!this.preloader.length) {
          return false;
        }
        const self = this;
        setTimeout(function () {
          $('body').removeClass('loading').addClass('loaded');
        }, 200);
        setTimeout(function () {
          self.preloader.hide();
        }, 700);
        return true;
      },
      preloadImages(callback) {
        if (this.showLoader()) {
          const self = this;
          if (this.isPreload) {
            $('body').imagesLoaded(function () {
              if (typeof callback === 'function') {
                callback();
              }
              self.hideLoader();
            });
            return;
          }
        }
        if (typeof callback === 'function') {
          callback();
        }
        this.hideLoader();
      },
      improveScrolling() {
        //Remove Hover Effect to Improve Scrolling Performance
        if (wyde.browser.touch === false && (!wyde.browser.msie || wyde.browser.msie > 9)) {
          let body = document.body,
            timer;
          window.addEventListener('scroll', function () {
            if (timer) {
              clearTimeout(timer);
            }
            if (!body.classList.contains('scrolling')) {
              body.classList.add('scrolling');
            }
            timer = setTimeout(function () {
              body.classList.remove('scrolling');
            }, 200);
          }, false);
        }
      },
      stateChange() {
        this.windowScroll = $(window).scrollTop();
        this.id = this.getPageId();
        this.isHome = $('body').hasClass('home');
        this.header = $('#header');
        this.headerTop = this.header.length ? this.header.position().top : 0;
        this.stickyHeight = $('body:not(.no-header) #header.w-sticky').length > 0 ? 65 : 0;
        this.mobileMenu = $('body.mobile-nav').length > 0;
        this.pageTop = $('#content').length ? $('#content').offset().top : 0;
        this.titleArea = $('.title-wrapper');
        if (this.titleArea.length > 0) {
          this.titleBottom = this.titleArea.offset().top + this.titleArea.outerHeight();
        } else {
          this.titleBottom = this.headerTop + this.header.height();
        }
      },
      load() {
        this.stateChange();
        this.ready = true;
      },
      contentLoad() {
        this.enableScroll();
        this.updateMenu();
        if (this.onePage) {
          this.initOnePageMenu();
        }
        this.showNav();
        const self = this;
        setTimeout(function () {
          self.initFooter();
        }, 500);
        let hash = window.location.hash;
        hash = hash.replace(/[^\w#_-]+/g, '');
        if (hash && hash !== '#' && $(hash).length) {
          if (hash === $('#nav .menu > li').first().find('a').attr('href')) {
            hash = 0;
          }
          this.scrollTimer = setTimeout(function () {
            self.scrollTo(hash);
          }, 500);
        }
      },
      scrolled(event) {
        this.windowScroll = $(window).scrollTop();
        this.headerSticky(this.windowScroll);
        if (this.onePage) {
          this.scrollSpy();
        }
      },
      resize(event) {
        $(window).trigger('wyde.page.statechange');
        this.updateMenu();
        this.initFooter();
      },
      headerSticky(scrolled) {
        if (this.header && this.header.is(':visible') && this.stickyHeight) {
          if (!this.titleArea.length && scrolled > 0 && scrolled + this.pageTop > this.headerTop) {
            this.header.addClass('w-fixed');
            $('body').addClass('sticky-nav');
          } else if (scrolled + this.pageTop > this.titleBottom) {
            this.header.removeClass('w-scrolled').addClass('w-fixed');
            $('body').addClass('sticky-nav');
          } else if (scrolled > 0 && scrolled + this.pageTop > this.headerTop) {
            this.header.removeClass('w-fixed').addClass('w-scrolled');
            $('body').addClass('sticky-nav');
          } else {
            this.header.removeClass('w-scrolled w-fixed');
            $('body').removeClass('sticky-nav');
          }
        }
      },
      scrollSpy() {
        if (this.sections && this.sections.length) {
          const fromTop = this.windowScroll + this.stickyHeight + 90;
          let currentSections = this.sections.map(function () {
            if ($(this).offset().top < fromTop) {
              return this;
            }
          });
          currentSections = currentSections[currentSections.length - 1];
          const id = currentSections && currentSections.length ? currentSections[0].id : '';
          if (this.currentSectionId !== id) {
            this.currentSectionId = id;
            $('.top-menu .menu-item > a, .vertical-menu .menu-item > a').each(function () {
              $(this).parent().removeClass('current-menu-item').end().filter('[href="#' + id + '"]').parent().addClass('current-menu-item');
            });
          }
        }
      },
      initMenu() {
        const self = this;
        $('.mobile-nav-icon').on('click', function () {
          if ($(document.body).hasClass('side-nav-active')) {
            self.hideMobileNav();
          } else {
            self.showMobileNav();
          }
        });
        this.initPrimaryNav();
        this.initSideNav();
        this.initSlidingBar();
        this.initExpandNav();
        this.initFullScreenNav();
        this.initSearch();
        this.updateScrollTarget();
      },
      initPrimaryNav() {
        if ($(window).width() < 1080) {
          $('body').addClass('mobile-nav');
        } else {
          $('body').removeClass('mobile-nav');
          const self = this;
          setTimeout(function () {
            const winWidth = $(window).width();
            $('.dropdown-nav li.menu-item-has-children:not(.megamenu)').each(function () {
              const rPos = $(this).offset().left + $(this).outerWidth() + $(this).find('> .sub-menu').outerWidth();
              if (rPos > winWidth) {
                $(this).addClass('align-right');
              } else {
                $(this).removeClass('align-right');
              }
            });
            $('.menu-cart .shopping-cart-content').each(function () {
              const $el = $(this);
              const updateMiniCart = function () {
                const maxHeight = $(window).height() - (self.pageTop + self.header.height() + $('.menu-cart .buttons').outerHeight() + 150);
                $el.css('max-height', maxHeight);
                $el.wydeScroller('refresh', maxHeight);
              };
              if ($el.find('.w-scroller').length) {
                updateMiniCart();
              } else {
                const maxHeight = $(window).height() - (self.pageTop + self.header.height() + $('.menu-cart .buttons').outerHeight() + 150);
                $el.css('max-height', maxHeight);
                $el.wydeScroller();
                $(document.body).on('added_to_cart', function () {
                  updateMiniCart();
                });
                $(window).on('resize.wyde.scroller', wydeDebounce(function () {
                  updateMiniCart();
                }));
              }
            });
          }, 500);
          this.initMegaMenu();
        }
      },
      initMegaMenu() {
        setTimeout(function () {
          $('.dropdown-nav .megamenu > ul').each(function () {
            const $el = $(this);
            $el.css('left', '');
            $el.css('width', $('.dropdown-nav').width());
            if ($el.position().left > 0) {
              $el.css('left', -$el.position().left);
            }
          });
        }, 1000);
      },
      initSideNav() {
        const $sidenav = $('#side-nav .side-nav-wrapper');
        $sidenav.wydeScroller({
          scrollbar: false
        });
        $('#vertical-nav').wydeVerticalMenu({
          changed() {
            // Refresh scroller
            $sidenav.wydeScroller('refresh');
          }
        });
      },
      initExpandNav() {
        $('.full-nav-icon').on('click', function () {
          $('body').toggleClass('full-nav-active ');
        });
      },
      initFullScreenNav() {
        const $el = $('#fullscreen-nav');
        if (!$el.length) {
          return;
        }
        const $scroller = $el.find('.full-nav-wrapper');
        let maxHeight;
        const self = this;
        $('.full-nav-icon').on('click', function () {
          self.showFullScreenNav();
        });
        const refreshScroller = function () {
          maxHeight = $el.height() - $el.find('.social-icons').outerHeight(true);
          const menuHeight = $('#full-nav').height();
          if (maxHeight > menuHeight) {
            maxHeight = menuHeight;
          }
          //$scroller.parent().height(maxHeight);
          $scroller.height(maxHeight);

          //$scroller.css("max-height", maxHeight);
        };
        const createScroller = function () {
          refreshScroller();
          $scroller.wydeScroller({
            scrollbar: false
          });
          $('#full-nav').wydeVerticalMenu({
            changed(o) {
              // Refresh scroller
              refreshScroller();
              $scroller.wydeScroller('refresh', maxHeight);
            }
          });
        };
        setTimeout(function () {
          createScroller();
        }, 100);
        $(window).on('resize', wydeDebounce(function () {
          refreshScroller();
        }));
      },
      initSlidingBar() {
        $('#slidingbar .slidingbar-wrapper').wydeScroller({
          scrollbar: false
        });
        const self = this;
        $('.menu-item-slidingbar > a').on('click', function (event) {
          event.preventDefault();
          if ($('body').hasClass('sliding-active')) {
            self.hideSlidingBar();
          } else {
            self.showSlidingBar();
          }
          return false;
        });
        $('.sliding-remove-button').on('click', function (event) {
          event.preventDefault();
          self.hideSlidingBar();
          return false;
        });
      },
      updateMenu() {
        this.initPrimaryNav();
      },
      updateMenuLinks() {
        this.updateScrollTarget();
        $('#vertical-nav').wydeVerticalMenu('refresh');
        $('#full-nav').wydeVerticalMenu('refresh');
      },
      showSlidingBar() {
        $('body').addClass('sliding-active');
        $('#slidingbar .slidingbar-wrapper').wydeScroller('refresh');
        const self = this;
        $('.sliding-active #page-overlay').off('click').on('click', function () {
          self.hideSlidingBar();
        });
      },
      hideSlidingBar() {
        $('body').removeClass('sliding-active');
      },
      initOnePageMenu() {
        const self = this;
        if (self.isHome) {
          $('#header-logo a, #side-nav-logo a').off('click').on('click', function (event) {
            event.preventDefault();
            self.scrollTo(0);
            if (window.location.hash) {
              history.pushState({
                path: self.siteURL
              }, '', self.siteURL);
            }
            return false;
          });
          this.currentSectionId = false;
          this.menuItems = $(".menu-item a[href^='#']");
          this.sections = this.menuItems.map(function () {
            const $item = $($(this).attr('href'));
            if ($item.length) {
              return $item;
            }
          });
        }
        if (this.windowScroll === 0) {
          $('#nav li').first().addClass('current-menu-item');
        }
      },
      updateScrollTarget() {
        const self = this;
        $(".top-menu .menu-item > a[href*='#'], .vertical-menu .menu-item > a[href*='#'], .footer-menu a[href*='#']").each(function () {
          if (this.pathname === window.location.pathname) {
            const $el = $(this);
            $el.on('click', function (event) {
              const hash = getHash($el.attr('href'));
              if (!hash) {
                return true;
              } else if (hash === '#') {
                event.preventDefault();
                return false;
              }
              event.preventDefault();
              let duration = 0;
              if ($('.mobile-nav.side-nav-active').length) {
                duration = 600;
                self.hideMobileNav();
              } else if ($('.fullscreen-nav.full-nav-active').length) {
                duration = 600;
                self.hideFullScreenNav();
              }
              if ($el.parent().hasClass('menu-item') && $el.parents('ul').find('li').index($el.parent()) == 0) {
                setTimeout(function () {
                  self.scrollTo(0);
                }, duration);
              } else {
                if (self.scrollTimer) {
                  clearTimeout(self.scrollTimer);
                }
                setTimeout(function () {
                  self.scrollTo(hash);
                }, duration);
              }
              history.pushState({}, $el.attr('title') ? $el.attr('title') : '', hash);
              return false;
            });
          }
        });
      },
      initFooter() {
        const $el = $('#footer');
        if ($('#footer').hasClass('w-sticky') && !(wyde.browser.xs || wyde.browser.sm)) {
          $('#content').css('margin-bottom', $el.height());
        } else {
          $('#content').css('margin-bottom', '');
        }
        this.initToTopButton();
      },
      initToTopButton() {
        const self = this;
        $('#toplink-button, #toplink-wrapper a').off('click').on('click', function (event) {
          event.preventDefault();
          self.scrollTo(0);
          return false;
        });
        $('#content').waypoint(function (direction) {
          if (direction === 'down') {
            $('#toplink-button').show();
            setTimeout(function () {
              $('#toplink-button').addClass('active');
            }, 100);
          } else {
            $('#toplink-button').removeClass('active');
            setTimeout(function () {
              $('#toplink-button').hide();
            }, 500);
          }
        }, {
          offset: -400
        });
        $('#content').waypoint(function (direction) {
          if (direction === 'down') {
            $('#toplink-button').removeClass('active');
            setTimeout(function () {
              $('#toplink-button').hide();
            }, 500);
          } else {
            $('#toplink-button').show();
            setTimeout(function () {
              $('#toplink-button').addClass('active');
            }, 100);
          }
        }, {
          offset: 'bottom-in-view'
        });
      },
      initSearch() {
        const $el = $('#live-search');
        const self = this;
        $('.live-search-button').on('click', function (event) {
          event.preventDefault();
          self.showSearch();
          return false;
        });
        $el.find('.fullscreen-remove-button').on('click', function (event) {
          event.preventDefault();
          self.hideSearch();
          return false;
        });
        $el.find('input').keypress(function (event) {
          if (event.which === 13) {
            event.preventDefault();
            $('form', $el).submit();
          }
        });
      },
      showMobileNav() {
        this.disableScroll();
        $('.mobile-nav').addClass('side-nav-active');
        const self = this;
        $('.side-nav-active #page-overlay').off('click').on('click', function () {
          self.hideMobileNav();
        });
      },
      hideMobileNav() {
        this.enableScroll();
        $('.mobile-nav').removeClass('side-nav-active');
      },
      showFullScreenNav() {
        const $el = $('#fullscreen-nav');
        if (!$el.length) {
          return;
        }
        const self = this;
        $('.full-nav-icon').off('click').on('click', function () {
          self.hideFullScreenNav();
        });
        setTimeout(function () {
          $('body').addClass('full-nav-active');
        }, 100);
      },
      hideFullScreenNav() {
        const $el = $('#fullscreen-nav');
        if (!$el.length) {
          return;
        }
        if (!$('body').hasClass('full-nav-active')) {
          return;
        }
        $('body').removeClass('full-nav-active');
        const self = this;
        $('.full-nav-icon').off('click').on('click', function () {
          self.showFullScreenNav();
        });
      },
      showSearch() {
        const $el = $('#live-search');
        this.disableScroll();
        this.hideNav();
        $el.show();
        setTimeout(function () {
          $el.addClass('active');
          if ($('.search-list li', $el).length > 0) {
            $el.find('.autocomplete').addClass('open').show();
          }
          $el.find('input').focus();
        }, 100);
      },
      hideSearch() {
        const $el = $('#live-search');
        if (!$el.hasClass('active')) {
          return;
        }
        this.enableScroll();
        $el.find('.autocomplete').removeClass('open').hide();
        this.showNav();
        $el.removeClass('active');
        setTimeout(function () {
          $el.hide();
        }, 500);
      },
      showNav() {
        $('#header').addClass('active');
      },
      hideNav() {
        $('#header').removeClass('active');
        $('body.mobile-nav').removeClass('side-nav-active');
        $('body').removeClass('sliding-active');
      },
      disableScroll() {
        if ($('html, body').hasClass('no-scroll')) {
          return;
        }
        setTimeout(function () {
          $('html, body').addClass('no-scroll');
        }, 300);
      },
      enableScroll() {
        $('html, body').removeClass('no-scroll');
      },
      scrollTo(target, options) {
        if (typeof options === 'function') {
          options = {
            onAfter: options
          };
        }
        let headerHeight = this.stickyHeight;
        if (!$('#header:visible').length || $('body.expand-nav:not(.full-nav-active)').length) {
          headerHeight = 0;
        }
        const settings = $.extend({}, {
          duration: 1000,
          easing: 'easeInOutExpo',
          offset: -(this.pageTop + headerHeight)
        }, options);
        $(window).scrollTo(target, settings);
      }
    }
  });

  /*****************************************
     Wyde AJAX Page
     /*****************************************/
  $.extend(wyde.page, {
    ajaxPage() {
      this.targetPos = 0;
      this.settings = {
        search: '.ajax-search-form',
        scope: '#content',
        excludeURLs: [],
        excludeSelectors: [],
        transition: 'fade'
      };
      if (typeof this.ajax_page_settings !== 'undefined') {
        this.settings = $.extend(this.settings, this.ajax_page_settings);
      }
      this.rootUrl = this.siteURL;
      this.searchPath = '';
      this.ignoreURLs = [];
      this.ignoreURLs.push('wp-login');
      this.ignoreURLs.push('wp-admin');
      this.ignoreURLs.push('wp-content');
      const self = this;
      $(this.settings.excludeURLs).each(function (i, v) {
        if (v) {
          self.ignoreURLs.push(v);
        }
      });
      $(this.settings.excludeSelectors).each(function () {
        if (this.tagName.toLowerCase() == 'a') {
          self.ignoreURLs.push(this.href);
        } else {
          $(this).find('a').each(function () {
            self.ignoreURLs.push(this.href);
          });
        }
      });

      // Internal Helper
      $.expr[':'].internal = function (obj, index, meta, stack) {
        let $el = $(obj),
          url = $el.attr('href') || '',
          isInternal;
        isInternal = url.substring(0, self.rootUrl.length) === self.rootUrl || url.indexOf(':') === -1;
        if ($el.attr('target') && $el.attr('target') !== '_self') {
          isInternal = false;
        }
        return isInternal;
      };
      this.updateLink();
      if (self.settings.search) {
        $(self.settings.search).each(function () {
          if ($(this).attr('action')) {
            //Get the current action so we know where to submit to
            self.searchPath = $(this).attr('action');

            //bind our code to search submit, now we can load everything through ajax :)
            //$("#searchform").name = "searchform";
            $(this).submit(function () {
              self.submitSearch($(this).serialize());
              return false;
            });
          }
        });
      }
      $(window).on('popstate', function (e) {
        self.loadContent(window.location);
      });
    },
    updateLink(newElements) {
      if (this.isIgnore(document.URL) || $('body').hasClass('woocommerce') || $('body').hasClass('woocommerce-page')) {
        return;
      }
      const self = this;
      $('a:internal:not(.ajax-page)', newElements ? newElements : document.body).each(function () {
        if (!self.isIgnore(this) && !$(this).parents('.woocommerce').length) {
          $(this).addClass('ajax-page').on('click', function (event) {
            event.preventDefault();
            const $el = $(this);
            let url = $el.attr('href');
            const title = $el.attr('title') || null;
            if (event.metaKey) {
              return true;
            }
            // set scroll target position
            self.targetPos = 0;
            const hash = getHash(url);
            if (hash) {
              url = url.replace(hash, '');
              self.targetPos = hash;
            }
            history.pushState({}, title, url);
            self.loadContent(url);
            return true;
          });
        }
      });
    },
    isIgnore(link) {
      if (!link) {
        return true;
      }
      const url = link.href ? link.href : link.toString();
      if (!url) {
        return true;
      }
      let samePage = false;
      const queryVars = getUrlVars(url);
      if (queryVars.page_id) {
        samePage = this.id === queryVars.page_id;
      } else {
        samePage = link.pathname === window.location.pathname;
      }
      if (this.onepage) {
        if ($('body').hasClass('search')) {
          samePage = false;
        }
      }
      const hash = getHash(url);
      if (hash === '#' || samePage && hash) {
        return true;
      }
      for (const i in this.ignoreURLs) {
        if (url.indexOf(this.ignoreURLs[i]) > -1) {
          return true;
        }
      }
      return false;
    },
    loadContent(url, getData) {
      this.absoluteURL = url;
      this.relativeURL = this.absoluteURL.replace(this.rootUrl, '');
      const self = this;
      this.hideContent(function () {
        self.removeSliders();
        $.ajax({
          type: 'GET',
          url,
          data: getData,
          cache: false,
          dataType: 'html',
          success(response) {
            self.updateContent(response);
            self.updateLink();
            $(window).trigger('wyde.page.pageloaded');
            self.showContent(function () {
              $(window).trigger('wyde.page.statechange');
              if (typeof self.contentLoad === 'function') {
                self.contentLoad();
              }
              $(window).trigger('wyde.page.ready');
              if (self.targetPos) {
                setTimeout(function () {
                  history.pushState({}, '', self.targetPos);
                  self.scrollTo(self.targetPos);
                }, 800);
              }
            });
          },
          error(jqXHR, textStatus, errorThrown) {
            window.location.href = url;
          },
          statusCode: {
            404() {
              console.log('Page not found!');
            }
          }
        });
      });
    },
    removeSliders() {
      // Revolution Slider
      document.querySelectorAll('rs-module').forEach(module => {
        if (typeof $(module).revkill === 'function') {
          $(module).revkill();
        }
      });
    },
    hideContent(callback) {
      $(window).trigger('wyde.page.beforechange');
      const self = this;
      const $el = $(self.settings.scope);
      const windowWidth = $(window).width() + 100;
      const windowHeight = $(window).height() + 100;
      let duration = 1000;
      switch (self.settings.transition) {
        case 'fade':
          duration = 800;
          $el.css(wyde.browser.prefix + 'transition', wyde.browser.prefix + 'opacity 0.8s').css({
            opacity: 0
          });
          break;
        case 'slideToggle':
          $('body').css({
            overflow: 'hidden'
          });
          $el.css(wyde.browser.prefix + 'transition', wyde.browser.prefix + 'transform 1s cubic-bezier(0.785, 0.135, 0.150, 0.860)').css(wyde.browser.prefix + 'transform', 'translateX(' + -windowWidth + 'px)');
          break;
        case 'slideLeft':
          $('body').css({
            overflow: 'hidden'
          });
          $el.css(wyde.browser.prefix + 'transition', wyde.browser.prefix + 'transform 1s cubic-bezier(0.785, 0.135, 0.150, 0.860)').css(wyde.browser.prefix + 'transform', 'translateX(' + -windowWidth + 'px)');
          setTimeout(function () {
            $el.css(wyde.browser.prefix + 'transition', '').css(wyde.browser.prefix + 'transform', 'translateX(' + windowWidth + 'px)');
          }, duration);
          break;
        case 'slideRight':
          $('body').css({
            overflow: 'hidden'
          });
          $el.css(wyde.browser.prefix + 'transition', wyde.browser.prefix + 'transform 1s cubic-bezier(0.785, 0.135, 0.150, 0.860)').css(wyde.browser.prefix + 'transform', 'translateX(' + windowWidth + 'px)');
          setTimeout(function () {
            $el.css(wyde.browser.prefix + 'transition', '').css(wyde.browser.prefix + 'transform', 'translateX(' + -windowWidth + 'px)');
          }, duration);
          break;
        case 'slideUp':
          $('body').css({
            overflow: 'hidden'
          });
          $el.css(wyde.browser.prefix + 'transition', wyde.browser.prefix + 'transform 1s cubic-bezier(0.785, 0.135, 0.150, 0.860), opacity 1s').css(wyde.browser.prefix + 'transform', 'translateY(' + -windowHeight + 'px)').css('opacity', 0);
          setTimeout(function () {
            $el.css(wyde.browser.prefix + 'transition', '').css(wyde.browser.prefix + 'transform', 'translateY(' + windowHeight + 'px)');
          }, duration);
          break;
        case 'slideDown':
          $('body').css({
            overflow: 'hidden'
          });
          $el.css(wyde.browser.prefix + 'transition', wyde.browser.prefix + 'transform 1s cubic-bezier(0.785, 0.135, 0.150, 0.860), opacity 1s').css(wyde.browser.prefix + 'transform', 'translateY(' + windowHeight + 'px)').css('opacity', 0);
          setTimeout(function () {
            $el.css(wyde.browser.prefix + 'transition', '').css(wyde.browser.prefix + 'transform', 'translateY(' + -windowHeight + 'px)');
          }, duration);
          break;
      }
      self.showLoader();
      setTimeout(function () {
        self.scrollTo(0, {
          duration: 100
        });
        if (typeof callback === 'function') {
          callback();
        }
      }, duration);
    },
    showContent(callback) {
      const self = this;
      let duration = 1000;
      const $el = $(self.settings.scope);
      const windowWidth = $(window).width() + 100;
      const windowHeight = $(window).height() + 100;
      this.preloadImages(function () {
        switch (self.settings.transition) {
          case 'fade':
            duration = 800;
            if (wyde.browser.css3) {
              $el.css({
                opacity: 1
              });
              setTimeout(function () {
                $el.css(wyde.browser.prefix + 'transition', '').css('opacity', '');
              }, duration + 500);
            } else {
              $el.animate({
                opacity: 1
              }, duration);
            }
            break;
          case 'slideToggle':
            if (wyde.browser.css3) {
              $el.css(wyde.browser.prefix + 'transform', 'translateX(0)');
              setTimeout(function () {
                $el.css(wyde.browser.prefix + 'transition', '').css(wyde.browser.prefix + 'transform', '');
                $('body').css({
                  overflow: ''
                });
              }, duration + 500);
            } else {
              $el.animate({
                left: 0
              }, duration, 'easeInOutCirc', function () {
                $('body').css({
                  overflow: ''
                });
              });
            }
            break;
          case 'slideLeft':
            if (wyde.browser.css3) {
              $el.css(wyde.browser.prefix + 'transition', wyde.browser.prefix + 'transform 1s cubic-bezier(0.785, 0.135, 0.150, 0.860)').css(wyde.browser.prefix + 'transform', 'translateX(0)');
              setTimeout(function () {
                $el.css(wyde.browser.prefix + 'transition', '').css(wyde.browser.prefix + 'transform', '');
                $('body').css({
                  overflow: ''
                });
              }, duration + 500);
            } else {
              $el.css({
                left: windowWidth
              }).animate({
                left: 0
              }, duration, 'easeInOutCirc', function () {
                $('body').css({
                  overflow: ''
                });
              });
            }
            break;
          case 'slideRight':
            if (wyde.browser.css3) {
              $el.css(wyde.browser.prefix + 'transition', wyde.browser.prefix + 'transform 1s cubic-bezier(0.785, 0.135, 0.150, 0.860)').css(wyde.browser.prefix + 'transform', 'translateX(0)');
              setTimeout(function () {
                $el.css(wyde.browser.prefix + 'transition', '').css(wyde.browser.prefix + 'transform', '');
                $('body').css({
                  overflow: ''
                });
              }, duration + 500);
            } else {
              $el.css({
                left: -windowWidth
              }).animate({
                left: 0
              }, duration, 'easeInOutCirc', function () {
                $('body').css({
                  overflow: ''
                });
              });
            }
            break;
          case 'slideUp':
            if (wyde.browser.css3) {
              $el.css(wyde.browser.prefix + 'transition', wyde.browser.prefix + 'transform 1s cubic-bezier(0.785, 0.135, 0.150, 0.860), opacity 0.5s ease-in 0.1s').css(wyde.browser.prefix + 'transform', 'translateY(0)').css('opacity', 1);
              setTimeout(function () {
                $el.css(wyde.browser.prefix + 'transition', '').css(wyde.browser.prefix + 'transform', '').css('opacity', '');
                $('body').css({
                  overflow: ''
                });
              }, duration + 500);
            } else {
              $el.css({
                top: windowHeight
              }).animate({
                top: 0,
                opacity: 1
              }, duration, 'easeInOutCirc', function () {
                $('body').css({
                  overflow: ''
                });
              });
            }
            break;
          case 'slideDown':
            if (wyde.browser.css3) {
              $el.css(wyde.browser.prefix + 'transition', wyde.browser.prefix + 'transform 1s cubic-bezier(0.785, 0.135, 0.150, 0.860), opacity 0.5s ease-in 0.1s').css(wyde.browser.prefix + 'transform', 'translateY(0)').css('opacity', 1);
              setTimeout(function () {
                $el.css(wyde.browser.prefix + 'transition', '').css(wyde.browser.prefix + 'transform', '').css('opacity', '');
                $('body').css({
                  overflow: ''
                });
              }, duration + 500);
            } else {
              $el.css({
                top: -windowHeight
              }).animate({
                top: 0,
                opacity: 1
              }, duration, 'easeInOutCirc', function () {
                $('body').css({
                  overflow: ''
                });
              });
            }
            break;
        }
        setTimeout(function () {
          if (typeof callback === 'function') {
            callback();
          }
        }, duration);
      });
    },
    getDocumentHtml(html) {
      const result = String(html).replace(/<\!DOCTYPE[^>]*>/i, '').replace(/<(html|head|body|title|meta)([\s\>])/gi, '<div class="document-$1"$2').replace(/<\/(html|head|body|title|meta)\>/gi, '</div>');
      return $.trim(result);
    },
    updateContent(data) {
      window.$ = jQuery;
      let $doc = null;
      let $body = null;
      if (window.DOMParser) {
        // all browsers, except IE before version 9
        try {
          let parser = new DOMParser();
          $doc = $(parser.parseFromString(data, 'text/html'));
          $body = $doc.find('body');
          parser = $doc = null;
        } catch (e) {
          $doc = $(this.getDocumentHtml(data));
          $body = $doc.find('.document-body:first');
        }
      } else {
        $doc = $(this.getDocumentHtml(data));
        $body = $doc.find('.document-body:first');
      }

      // Update content
      const $content = this.settings.scope === 'body' ? $body.html() : $body.find(this.settings.scope).html();
      $(this.settings.scope).html($content);

      // Update Stylesheet
      const self = this;
      const $cssLinks = $body.find("link[rel='stylesheet']");
      $cssLinks.each(function () {
        if ($("body link[id='" + $(this).attr('id') + "']").length == 0) {
          $(self.settings.scope).append(this);
        }
      });

      // Update Body Classes
      let oldClasses = $('body').attr('class');
      oldClasses = oldClasses.replace(' loading', '');
      const newClasses = $body.attr('class');
      if (newClasses) {
        $('body').removeClass(oldClasses).addClass('changing').addClass(newClasses);
      }

      // Update VC Custom CSS
      $('head').find("style[data-type='vc_shortcodes-custom-css'], style[data-type='vc_custom-css']").remove();
      const $vc_custom_styles = $(data).filter("style[data-type='vc_shortcodes-custom-css'], style[data-type='vc_custom-css']");
      if ($vc_custom_styles.length) {
        $('head').append($vc_custom_styles);
      }

      // Update the title
      $('head').find('title').replaceWith($(data).filter('title'));

      // Update WP Admin Bar
      if ($('#wpadminbar').length > 0) {
        const $adminBar = $body.find('#wpadminbar');
        if ($adminBar.length) {
          $('#wpadminbar').html($adminBar.html());
        }
      }

      // Update Header
      this.updateNavigation($body);

      // Update Footer
      this.updateFooter($body);

      // Inform Google Analytics of the change
      this.googleTracking();

      // Inform ReInvigorate of a state change
      if (typeof window.reinvigorate !== 'undefined' && typeof window.reinvigorate.ajax_track !== 'undefined') {
        reinvigorate.ajax_track(this.absoluteURL);
      }
    },
    updateNavigation($body) {
      // Update header class
      const headerClasses = $body.find('#header').attr('class');
      $('#header').attr('class', headerClasses);
      if (this.onePage) {
        //Update menu items
        $('.menu-item').each(function () {
          const newItem = $body.find('#' + $(this).attr('id'));
          if (newItem.length) {
            $(this).attr('class', newItem.attr('class'));
            $(this).find('> a').replaceWith(newItem.find('>a'));
          }
        });
        this.updateMenuLinks();
        this.updateLink($('.menu-item'));
      } else {
        // Clear menu state
        $('.top-menu li, .vertical-menu li').removeClass('current-menu-ancestor current-menu-parent current-menu-item current_page_parent current_page_ancestor current_page_item');
        // Update current dropdown menu
        $body.find('.top-menu .current-menu-ancestor, .top-menu .current-menu-parent, .top-menu .current-menu-item').each(function () {
          $('.top-menu .' + $(this).attr('id')).removeClass().addClass($(this).attr('class'));
        });
        // Update current vertical menu
        $body.find('#vertical-nav .current-menu-ancestor, #vertical-nav .current-menu-parent, #vertical-nav .current-menu-item').each(function () {
          $('.vertical-menu .' + $(this).attr('id').replace('vertical-', '')).removeClass().addClass($(this).attr('class'));
        });
      }
    },
    updateFooter($body) {
      // Update header class
      const $newFooter = $body.find('#footer');
      if ($newFooter.length) {
        const newClasses = $newFooter.attr('class');
        $('#footer').attr('class', newClasses).html($newFooter.html());
      }
    },
    googleTracking() {
      const self = this;
      // Check new version of Google Analytics
      if (typeof ga === 'function') {
        ga(function () {
          const trackers = ga.getAll();
          $.each(trackers, function (i, v) {
            v.send('pageview', {
              page: self.relativeURL,
              title: document.title
            });
            //v.send("pageview");
          });
        });
      } else if (typeof window._gaq !== 'undefined') {
        // Old version of Google Analytics
        window._gaq.push(['_trackPageview', self.relativeURL]);
      }
    },
    submitSearch(param) {
      this.loadContent(this.searchPath, param);
    }
  });

  /*****************************************
     Wyde Ajax Search
     /*****************************************/
  $.extend(wyde.page, {
    ajaxSearch(options) {
      let settings = {
        delay: 500,
        element: '#live-search',
        minlength: 1
      };
      settings = $.extend(true, settings, options);
      if (!this.ajaxURL) {
        return;
      }
      const self = this;
      return $(settings.element).each(function () {
        let ajaxTimer = null;
        const $el = $(this);
        let $wrapper,
          $autocomplete,
          $searchlist,
          $more = false;
        function createAutoComplete() {
          $wrapper = $el.find('.container');
          $wrapper.append($('<div class="autocomplete"><ul class="search-list"></ul></div>'));
          $autocomplete = $wrapper.find('.autocomplete');
          $searchlist = $autocomplete.find('.search-list');
          $more = $('<div class="search-more"></div>');
          $wrapper.append($more);
          $autocomplete.wydeScroller();
          $(window).on('resize', wydeDebounce(function () {
            updateSearchList();
          }));
        }
        function updateSearchList() {
          const h = $(window).height() - $more.outerHeight() - ($autocomplete.offset().top - $(window).scrollTop());
          $autocomplete.css('height', h);
          $autocomplete.wydeScroller('refresh');
        }
        function getListItems(name, items) {
          const list = $('<ul></ul>').attr('id', String.format('{0}-list', name.toLowerCase()));
          $.each(items, function () {
            let image = '';
            if (this.post_image) {
              image = String.format('<span class="thumb"><img src="{1}" alt="{2}"></span>', this.post_link, this.post_image, this.post_title);
            }
            let author = '';
            if (this.post_author) {
              author = String.format('<span>{0}</span> &#8211; ', this.post_author);
            }
            list.append($(String.format('<li><a href="{1}">{0}<span><strong>{2}</strong><span class="post-meta">{3}<span>{4}</span></span></span></a></li>', image, this.post_link, this.post_title, author, this.post_date)));
          });
          return list;
        }
        function clearSearchList() {
          $searchlist.html('');
          $more.html('');
        }
        function loadResults(ajaxURL) {
          if (!$autocomplete) {
            createAutoComplete();
          }
          const data = {
            action: 'flora_search',
            search_keyword: $('input', $el).val()
          };
          if (data.search_keyword.length == 0) {
            $autocomplete.hide().removeClass('open');
            clearSearchList();
            return;
          }
          $autocomplete.show().addClass('open');
          $autocomplete.css('height', '20px');
          $more.removeClass('selected').html('<p class="search-loading"><span class="w-loader"></span></p>');
          $.post(ajaxURL, data, function (response) {
            $searchlist.html('');
            const results = $.parseJSON(response);
            if (results && results.length > 0) {
              results.sort(function (a, b) {
                const x = a.title;
                const y = b.title;
                return x < y ? -1 : x > y ? 1 : 0;
              });
              $.each(results, function () {
                const $list = $(String.format('<li><h4>{0}</h4></li>', this.title));
                $list.append(getListItems(this.name, this.items));
                $searchlist.append($list);
              });
            }
            if (results.length == 0) {
              $more.addClass('selected');
            }
            $more.html(String.format('<a href="{0}/?s={1}">See more results for "{1}"</a>', self.siteURL, $('input', $el).val()));
            if (self.ajax_page) {
              self.updateLink($('li', $autocomplete.not('#product-list')));
            }
            if ($el.hasClass('active')) {
              $autocomplete.show().addClass('open');
              $searchlist.focus();
            }
            updateSearchList();
          });
        }
        createAutoComplete();
        $('input', $el).attr('autocomplete', 'off');
        $('input', $el).keyup(function (event) {
          if (event.keyCode != '38' && event.keyCode != '40' && event.keyCode != '13' && event.keyCode != '27' && event.keyCode != '39' && event.keyCode != '37') {
            if ($(this).val().length < settings.minlength) {
              clearSearchList();
              return;
            }
            if (ajaxTimer != null) {
              clearTimeout(ajaxTimer);
            }
            ajaxTimer = setTimeout(function () {
              loadResults(self.ajaxURL);
            }, settings.delay);
          }
        });
      });
    }
  });
  wyde.page.init();

  /*****************************************
     Parallax Title Area
     /*****************************************/
  function parallaxTitleArea() {
    let isBusy = false;
    let lastScrollPos, titleHeight, headerHeight;
    const refresh = function () {
      titleHeight = wyde.page.titleArea ? wyde.page.titleArea.outerHeight(true) : 0;
      headerHeight = wyde.page.header.height();
    };
    const render = function () {
      lastScrollPos = $(window).scrollTop();
      if (lastScrollPos < headerHeight + titleHeight) {
        const yPos = Math.round(lastScrollPos * 0.3);
        const transOut = 1 - lastScrollPos / titleHeight;
        const transIn = 1 + lastScrollPos / titleHeight;
        $('.title-wrapper.w-parallax .bg-image').css(wyde.browser.prefix + 'transform', 'translate3d(0px, ' + yPos + 'px, 0px)');
        if ($('.title-wrapper').data('effect')) {
          switch ($('.title-wrapper').data('effect')) {
            case 'split':
              $('.title-wrapper .container .title').css(wyde.browser.prefix + 'transform', 'translate3d(0px, ' + yPos * 0.1 + 'px, 0px)').css('opacity', transOut);
              $('.title-wrapper .container .subtitle').css(wyde.browser.prefix + 'transform', 'translate3d(0px, ' + yPos * 1.2 + 'px, 0px)').css('opacity', transOut);
              break;
            case 'fadeOut':
              $('.title-wrapper .container').css(wyde.browser.prefix + 'transform', 'translate3d(0px, ' + yPos * 1.1 + 'px, 0px)').css('opacity', transOut);
              break;
            case 'fadeOutUp':
              $('.title-wrapper .container').css(wyde.browser.prefix + 'transform', 'translate3d(0px, ' + yPos * 0.1 + 'px, 0px)').css('opacity', transOut);
              break;
            case 'fadeOutDown':
              $('.title-wrapper .container').css(wyde.browser.prefix + 'transform', 'translate3d(0px, ' + yPos * 1.8 + 'px, 0px)').css('opacity', transOut);
              break;
            case 'zoomOut':
              $('.title-wrapper .container').css(wyde.browser.prefix + 'transform', 'translate3d(0px, ' + yPos * 1.1 + 'px, 0px) scale3d(' + transOut + ', ' + transOut + ', 1)').css('opacity', transOut);
              break;
            case 'zoomOutUp':
              $('.title-wrapper .container').css(wyde.browser.prefix + 'transform', 'translate3d(0px, ' + yPos * 0.1 + 'px, 0px) scale3d(' + transOut + ', ' + transOut + ', 1)').css('opacity', transOut);
              break;
            case 'zoomOutDown':
              $('.title-wrapper .container').css(wyde.browser.prefix + 'transform', 'translate3d(0px, ' + yPos * 1.8 + 'px, 0px) scale3d(' + transOut + ', ' + transOut + ', 1)').css('opacity', transOut);
              break;
            case 'zoomIn':
              $('.title-wrapper .container').css(wyde.browser.prefix + 'transform', 'translate3d(0px, ' + yPos * 1.1 + 'px, 0px) scale3d(' + transIn + ', ' + transIn + ', 1)').css('opacity', transOut);
              break;
            case 'zoomInUp':
              $('.title-wrapper .container').css(wyde.browser.prefix + 'transform', 'translate3d(0px, ' + yPos * 0.1 + 'px, 0px) scale3d(' + transIn + ', ' + transIn + ', 1)').css('opacity', transOut);
              break;
            case 'zoomInDown':
              $('.title-wrapper .container').css(wyde.browser.prefix + 'transform', 'translate3d(0px, ' + yPos * 1.8 + 'px, 0px) scale3d(' + transIn + ', ' + transIn + ', 1)').css('opacity', transOut);
              break;
          }
        }
      }
    };
    const requestRender = function () {
      if (!isBusy) {
        isBusy = true;
        window.requestAnimationFrame(function () {
          render();
          isBusy = false;
        });
      }
    };
    $(window).on('scroll', function () {
      requestRender();
    });
    $(window).on('resize', wydeDebounce(function () {
      refresh();
    }));
    refresh();
    requestRender();
  }

  /*****************************************
     Call on Wyde Page Ready event
     /*****************************************/
  $(window).on('wyde.page.ready', function () {
    if (wyde.browser.md || wyde.browser.lg) {
      parallaxTitleArea();
    }
    if (wyde.browser.touch) {
      $('.share-icon').on('click', function (e) {
        e.preventDefault();
        $(this).parent().toggleClass('touch-hover');
      });
    }
  });
})(jQuery);
/******/ })()
;