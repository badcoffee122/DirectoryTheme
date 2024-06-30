(function(){
    var difl_testimonialcarousel = document.querySelectorAll('.difl_testimonialcarousel');
    [].forEach.call(difl_testimonialcarousel, function(ele, index) {
        const container = ele.querySelector('.df_tc_container');
        const data = JSON.parse(container.dataset.settings);
        const selector = ele.querySelector('.swiper-container');

        const item_spacing_tablet = '' !== data.item_spacing_tablet ? data.item_spacing_tablet : data.item_spacing;
        const item_spacing_phone = '' !== data.item_spacing_phone ? data.item_spacing_phone : item_spacing_tablet;

        var config = {
            speed: parseInt(data.speed),
            loop: data.loop,
            effect: data.effect,
            centeredSlides: data.centeredSlides === 'on' ? true : false,
            threshold: 15,

            slideClass: 'difl_testimonialcarouselitem',
            observer: true,
            observeParents: true,
            observeSlideChildren: true,
            watchSlidesVisibility: true,
            preventClicks : true,
            preventClicksPropagation: true,
            slideToClickedSlide: false,

            breakpoints: {
                // desktop
                981: {
                    slidesPerView: data.desktop,
                    spaceBetween : parseInt(data.item_spacing)
                },
                // tablet
                768: {
                    slidesPerView: data.tablet,
                    spaceBetween : parseInt(item_spacing_tablet)
                },
                // mobile
                1: {
                    slidesPerView: data.mobile,
                    spaceBetween : parseInt(item_spacing_phone)
                },
            }
        };

        if (data.effect === 'coverflow') {
            config['coverflowEffect'] = {
                slideShadows: data.slideShadows === 'on' ? true : false,
                rotate: parseInt(data.rotate),
                stretch: parseInt(data.stretch),
                depth: parseInt(data.depth),
                modifier: parseInt(data.modifier)
            };
        }

        // autoplay
        if (data.autoplay === 'on') {
            config['autoplay'] = {
                delay : data.auto_delay,
                disableOnInteraction: false
            }
        }
        // arrow navigation
        if (data.arrow === 'on') {
            config['navigation'] = {
                nextEl: '.tc-next-'+data.order,
                prevEl: '.tc-prev-'+data.order
            }
        }
        // dots pagination
        if (data.dots === 'on') {
            config['pagination'] = {
                el: '.tc-dots-'+data.order,
                type: 'bullets',
                clickable: true
            }
        }

        if (typeof Swiper === 'function') {
            var slider = new Swiper (selector, config);
            slider.update()

            // pause on hover
            if ( data.autoplay === 'on' && data.pause_hover === 'on') {
                selector.addEventListener("mouseover", function(){
                    slider.autoplay.stop();
                })
                selector.addEventListener("mouseout", function(){
                    slider.autoplay.start();
                })
            }    
        }
        // pointer event
        df_tc_handle_mouseover_event(ele);
    })
})()

function df_tc_handle_mouseover_event(ele) {
    const hover_class = 'df-ele-hover';
    let class_list = ele.classList;
    
    ele.addEventListener('mouseleave', function(event) {
        if(class_list.contains(hover_class)) {
            setTimeout(function(){
                ele.classList.remove(hover_class);
            }, 3000);
        }
    })

    ele.addEventListener('mouseenter', function(event) {
        if( !ele.classList.contains(hover_class) ) {
            ele.classList.add(hover_class);
        }
    })
}