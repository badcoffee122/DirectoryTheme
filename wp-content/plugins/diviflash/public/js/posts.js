(function () {
    var df_posts = document.querySelectorAll('.difl_postgrid');
    [].forEach.call(df_posts, function (ele, index) {
        const element = ele.querySelector('.df_postgrid_container');
        if (null === element || undefined === element) {
            return;
        }
        var settings = JSON.parse(element.dataset.settings)
        var selector = ele.querySelector('.df-posts-wrap');

        if (settings.layout === 'masonry') {
            var masonry = new Isotope(selector, {
                layoutMode: 'masonry',
                itemSelector: '.df-post-item',
                percentPosition: true
            });

            // fix the lazy load layout issue
            var entries = selector.querySelectorAll('.df-post-item');
            observer = new IntersectionObserver(function (item) {
                masonry.layout();
            });
            [].forEach.call(entries, function (v) {
                observer.observe(v);
            })
            // *****************
            imagesLoaded(selector).on('progress', function () {
                masonry.layout();
            })
                .on('done', function () {
                    if (window.wp.mediaelement) {
                        window.wp.mediaelement.initialize()
                    }
                    masonry.layout();
                })
            setTimeout(function () {
                masonry.layout();
            }, 500);

            jQuery(document).ajaxSuccess(function () {
                masonry = new Masonry(ele.querySelector('.df-posts-wrap'), {
                    layoutMode: 'masonry',
                    itemSelector: '.df-post-item',
                    percentPosition: true
                });
                setTimeout(function () {
                    masonry.layout();
                }, 100);
            });

        }

    })

    jQuery('body').on('click', '.df-post-outer-wrap .et_main_video_container', function (event) {
        jQuery(this).find('.et_pb_video_overlay').addClass('df-hide-overlay');
    })

})()