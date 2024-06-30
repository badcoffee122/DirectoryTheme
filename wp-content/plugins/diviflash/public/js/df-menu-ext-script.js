(function($){
    const dfMenuEx = {
        navItem: $('.df-menu-nav li'),
        mMenuButton: $('.df-mobile-menu-button'),
        subMenu: $('.df-normal-menu-wrap .df-custom-submenu'), 
        ofcButton: $('.df-offcanvas-menu-button'), 
        ofcSubMenu: $('.df-offcanvas-menu .sub-menu'), 
        ofcbMenuItem: $('.df-offcanvas-menu .menu-item a'), 
        mSubMenu: $('.df-mobile-menu .sub-menu'),
        fullWidthType: $('.df-normal-menu-wrap [data-menu-width-type="full_width"]'),
        positionBottomCenter: $('.df-normal-menu-wrap [data-submenu-position="bottom_center"]'),
        searchModalTriggerButton: $('.df-am-search-button'),
        init: function() {
            this.subMenuReveal();
            this.mobileMenuSlide();
            this.revealOfc();
            this.searchBoxModal();
            this.megaMenuColumn();
            this.hideOnSticky();
            //this.button_show_on_hover_class_add();
        },
        hideOnSticky: function() {            
            $(window).on('scroll', function(ev){
                if($('.et_pb_sticky_module').hasClass('et_pb_sticky')) {
                    $('.hide_on_sticky').slideUp();
                } else {
                    $('.hide_on_sticky').slideDown();
                }
            })
        },
        megaMenuColumn: function() {
            $('.df-normal-menu-wrap .df-mega-menu').each(function(i, ele) {
                const _col_number = Number(ele.dataset.column);
                let _c = 1;
                $(this).find(".df-mega-menu-item>li").each(function(index, element){
                    if(!$(this).attr("data-column")) {
                        $(this).attr("data-column", _c);
                        if(_c === _col_number) {
                            _c = 1;
                        } else {
                            _c++;
                        }
                    }
                });
                if(!$(this).find('>ul').hasClass('col-added')) {
                    $(this).find('[data-column="1"]').wrapAll('<div class="col col-1"></div>');
                    $(this).find('[data-column="2"]').wrapAll('<div class="col col-2"></div>');
                    $(this).find('[data-column="3"]').wrapAll('<div class="col col-3"></div>');
                    $(this).find('[data-column="4"]').wrapAll('<div class="col col-4"></div>');
                    $(this).find('[data-column="5"]').wrapAll('<div class="col col-5"></div>');
                    $(this).find('[data-column="6"]').wrapAll('<div class="col col-6"></div>');
                    $(this).find('[data-column="7"]').wrapAll('<div class="col col-7"></div>');
                    $(this).find('>ul').addClass('col-added');
                }
            })
        },
        megaMenu: function($obj) {
            if($obj.hasClass('df-mega-menu')) {
                var _dataSet = $obj[0].dataset;
                var offsetLeft = $obj.offset().left;
                var containerOffsetLeft = $obj.closest('.row-inner').offset().left;
                  
                if( _dataSet.width === 'full_width' ) {
                    $obj.find(">.sub-menu")
                    .css('width', $(window).width())
                    .css('left', `-${$obj.offset().left}px`);
                } else if ( _dataSet.width === 'custom_width' ) {
                    var _width = _dataSet.widthValue ? parseInt(_dataSet.widthValue) : '270';
                    var _left = '0';
                    if( _dataSet.alignment === 'bottom_center' ) {
                        _left = `-${Number(_width)/2 - ($obj.width() /2)}`;
                    } else if ( _dataSet.alignment === 'bottom_right' ) {
                        _left = `-${Number(_width) - $obj.width()}`;
                    }
                    $obj.find(">.sub-menu")
                    .css('width', _width)
                    .css('left', `${_left}px`);
                } else {
                    $obj.find(">.sub-menu")
                    .css('width', $obj.closest('.row-inner').width())
                    .css('left', -`${offsetLeft - containerOffsetLeft}`);
                }
            }
        },
        subMenuReveal: function() {
            $('.df-mega-menu > .sub-menu').addClass('df-mega-menu-item');
            $('.df-mega-menu > .sub-menu .sub-menu').addClass('df-inside-mega-menu');
            $('.df-normal-menu-wrap .df-menu-nav li').each(function(index, ele){
                var $this = $(this);
                const isInsideMegaMenu = $this.parent().hasClass('df-mega-menu-item') || $this.parent().hasClass('df-inside-mega-menu') || $this.parent().hasClass('col') ? true : false;
                // reverse direction class for submenu
                if(!isInsideMegaMenu) {
                    if(($(window).width() - ele.getBoundingClientRect().left) < 420) {
                        $this.addClass('df-submenu-reverse');
                    }
                }
            });

            $('.df-normal-menu-wrap .df-menu-nav').on({
                mouseenter: function() {
                    var _this = $(this);
                    const isInsideMegaMenu = _this.parent().hasClass('df-mega-menu-item') || _this.parent().hasClass('df-inside-mega-menu') || _this.parent().hasClass('col') ? true : false;
                    dfMenuEx.megaMenu(_this);
                    _this.css('overflow', 'visible');
                    if(!isInsideMegaMenu) {
                        _this.addClass('df-hover')
                        .addClass('df-show-dropdown');
                    }
                    if(_this.hasClass('menu-item-level-0')) {
                        const _zIndex = _this.closest('.et_pb_section').css('z-index');
                        if(_zIndex === 'auto') {
                            _this.closest('.et_pb_section').css('z-index', '999');
                        } else {
                            _this.closest('.et_pb_section').css('z-index', _zIndex);
                        }
					} else {
                        if(!isInsideMegaMenu) {
                            if(_this.hasClass('df-submenu-reverse')) {
                                _this.find('>.sub-menu').css('right', _this.outerWidth());
                            } else {
                                _this.find('>.sub-menu').css('left', _this.outerWidth());
                            }
                        }
                    }
                    _this.find(">.sub-menu").addClass('df-hover');
                },
                mouseleave: function () {
                    var _this = $(this);
                    const isInsideMegaMenu = _this.parent().hasClass('df-mega-menu-item') || _this.parent().hasClass('df-inside-mega-menu') || _this.parent().hasClass('col') ? true : false;  
                    if(!isInsideMegaMenu) {
                        _this.removeClass('df-hover')
                        .removeClass('df-show-dropdown');  
                    }
                    setTimeout(function(){
                        if(!_this.hasClass('df-show-dropdown')) {
                            _this.find(">.sub-menu").removeClass('df-hover');
                        }
                    }, 200);
                }
            }, 'li');

            $('.sub-menu').on({
                mouseenter: function() {
                    $(this).css('z-index', '99');
                },
                mouseleave: function () {
                    $(this).css('z-index', '');
                }
            }, '.col');
        },
        revealOfc: function() {
            dfMenuEx.ofcButton.on('click', function(ev) {
                ev.preventDefault();
                var ofcClass = $(`.df-offcanvas-wrap[data-menu="${ev.target.dataset.menu}"]`);
                ofcClass.toggleClass('df-menu-show');
                ofcClass.css('z-index', '999999');
                ofcClass.find('.df-ofc-close').on('click', function() {
                    ofcClass.removeClass('df-menu-show');
                })
            })
            dfMenuEx.ofcSubMenuReveal();
        },
        ofcSubMenuReveal: function() {
            dfMenuEx.ofcbMenuItem.on('click', function(ev) {
                if(ev.originalEvent.detail === 2 ) return;
                var _this = $(this);
                var item = _this.siblings('.sub-menu');
                if(item.length > 0) {
                    ev.preventDefault();
                    _this.siblings('.sub-menu').toggleClass('open');
                    _this.siblings('.sub-menu').slideToggle("slow")
                }
            })
        },
        mSubmenuReveal: function() {
            dfMenuEx.mSubMenu.each(function(){
                var $this = $(this);
                $this.siblings("a").on('click', function(ev){
                    if(ev.originalEvent.detail === 2 ) return;
                    ev.preventDefault();
                    $this.slideToggle("slow");
                    $(this).parent().toggleClass('df-show-dropdown');
                })
            })
        },
        mobileMenuSlide: function() {
            dfMenuEx.mMenuButton.on('click', function(ev){
                ev.preventDefault();
                var mobileMenuClass = ev.target.dataset.menu;
                $(`.${mobileMenuClass}`).slideToggle('slow')
                .closest('.et_pb_section').css('z-index', '99');
            })
            dfMenuEx.mSubmenuReveal();
        },
        searchBoxModal: function() {
            $('.df-searchbox-style-5.df-am-search').css('opacity', 1);
            $(document).click(function(event) {
                const target = event.target;
                const $popup = $('.df-searchbox-style-5.df-am-search.show');
                if(!target.classList.value.includes('df-am-search-button')) {
                    if (!$popup.is(target) && !$popup.has(target).length) {
                        $popup.removeClass('show');
                    }
                }
            })
            dfMenuEx.searchModalTriggerButton.on('click', function(ev){
                var searchModal = ev.target.dataset.search;
                $(`.${searchModal}_modal`).toggleClass('show');
            })
            $('.serach-box-close').on('click', function(){
                $(this).parent().removeClass('show');
            })
        },
        button_show_on_hover_class_add: function(){
            var selectors = document.querySelectorAll('.difl_advancedmenu');
                [].forEach.call(selectors, function (selector, index) {
               var elements = selector.querySelectorAll('.df-am-col.right .df-menu-button.show_icon_on_hover');
                //console.log(elements.length);
                // Check if any elements were found
                if (elements.length > 0) {
                    selector.querySelector('.df-am-col.right').classList.add('show_icon_on_hover');
                }
            
            
            });
        }
    }
    document.addEventListener( 'DOMContentLoaded', () => {
        dfMenuEx.init();
    } );
})(jQuery)
