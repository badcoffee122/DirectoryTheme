(function( $ ){
    const dfMultiFilter = {
        multiple_filter_data: {},
        multi_filter_selector: null,
        selectBox: null,
        grid_container: null,
        selector: null,
        current_column:null,
        search_key:'',
        init: function(element , ele , current_column , search_key ='') {  
            dfMultiFilter.grid_container = ele.querySelector('.df-cpts-wrap');
            dfMultiFilter.selector = ele.querySelector('.df-cpts-inner-wrap');
            dfMultiFilter.search_key = '' !== search_key ? search_key: '';
            dfMultiFilter.ele_class = ele.classList.value.split(" ").filter(function(class_name){
                return class_name.indexOf('difl_cptfilter_') !== -1;
            });
            dfMultiFilter.multi_filter_selector = ele.querySelectorAll('.multiple_taxonomy_filter li');
            const wrapper = document.createElement("div");
            wrapper.addEventListener("click", this.clickOnWrapper);
            wrapper.classList.add("multi-select-component");
        
            // Create elements of search
            const search_div = document.createElement("div");
            search_div.classList.add("search-container");
            const input = document.createElement("input");
            input.classList.add("selected-input");
            input.setAttribute("autocomplete", "off");
            input.setAttribute("tabindex", "0");
            input.addEventListener("keyup", this.inputChange);
            input.addEventListener("keydown", this.deletePressed);
            input.addEventListener("click", this.openOptions);
            dfMultiFilter.selectBox = input;
            const dropdown_icon = document.createElement("a");
            dropdown_icon.setAttribute("href", "javascript:void(0);");
            dropdown_icon.classList.add("dropdown-icon");
            dropdown_icon.addEventListener("click", this.clickDropdown);
            const autocomplete_list = document.createElement("ul");
            autocomplete_list.classList.add("autocomplete-list")
            search_div.appendChild(input);
            search_div.appendChild(autocomplete_list);
            search_div.appendChild(dropdown_icon);
        
            // set the wrapper as child (instead of the element)
            element.parentNode.replaceChild(wrapper, element);
            // set element as child of wrapper
            wrapper.appendChild(element);
            wrapper.appendChild(search_div);
            // display the modal
            this.createInitialTokens(element);
            this.addPlaceholder(wrapper);
        },

        removePlaceholder: function(wrapper){
            const input_search = wrapper.querySelector(".selected-input");
            input_search.removeAttribute("placeholder");
        },
        
        addPlaceholder: function(wrapper) {
            const input_search = wrapper.querySelector(".selected-input");
            const term_title = wrapper.querySelector('select[title]').getAttribute("title");
            const tokens = wrapper.querySelectorAll(".selected-wrapper");
            const prefex_text = df_cpt_filter[dfMultiFilter.ele_class[0]]? df_cpt_filter[dfMultiFilter.ele_class[0]].multi_filter_dropdown_placeholder_prefix + ' ' : '';
            if (!tokens.length && !(document.activeElement === input_search))
                input_search.setAttribute("placeholder", prefex_text + term_title);
        },
        
        
        // Function that create the initial set of tokens with the options selected by the users
        createInitialTokens: function(element) {
            let {
                options_selected
            } = dfMultiFilter.getOptions(element);

            let {
                options_selected_label
            } = dfMultiFilter.getOptions(element);

            const wrapper = element.parentNode;
            for (let i = 0; i < options_selected.length; i++) {
                // dfMultiFilter.createToken(wrapper, options_selected[i]);
                dfMultiFilter.createToken(wrapper, options_selected[i], options_selected_label[i]);
            }
        },
        inputChange : function(e){
            const wrapper = e.target.parentNode.parentNode;
            const select = wrapper.querySelector("select");
            const dropdown = wrapper.querySelector(".dropdown-icon");
        
            const input_val = e.target.value;
        
            if (input_val) {
                dropdown.classList.add("active");
                dfMultiFilter.populateAutocompleteList(select, input_val.trim());
            } else {
                dropdown.classList.remove("active");
                const event = new Event('click');
                dropdown.dispatchEvent(event);
            }          
        },
        
        
        // Listen for clicks on the wrapper, if click happens focus on the input
        clickOnWrapper : function(e){
            const wrapper = e.target;
            if (wrapper.tagName == "a") {
                const input_search = wrapper.querySelector(".selected-input");
                const dropdown = wrapper.querySelector(".dropdown-icon");
                if (!dropdown.classList.contains("active")) {
                    const event = new Event('click');
                    dropdown.dispatchEvent(event);
                }
                input_search.focus();
                dfMultiFilter.removePlaceholder(wrapper);
            }
        
        },
        
        openOptions: function(e) {
            const input_search = e.target;
            const wrapper = input_search.parentElement.parentElement;
            const dropdown = wrapper.querySelector(".dropdown-icon");
            if (!dropdown.classList.contains("active")) {
                const event = new Event('click');
                dropdown.dispatchEvent(event);
            }
            e.stopPropagation();
        
        },

        createToken :function(wrapper, value, label){
            const search = wrapper.querySelector(".search-container");
            // Create token wrapper
            const token = document.createElement("div");
            token.classList.add("selected-wrapper");
            const token_span = document.createElement("span");
            token_span.classList.add("selected-label");
            token_span.innerText = label;
            const close = document.createElement("a");
            close.classList.add("selected-close");
            close.setAttribute("tabindex", "-1");
            close.setAttribute("data-option", value);
            close.setAttribute("data-hits", 0);
            close.setAttribute("href", "javascript:void(0);");
            close.innerText = "x";
            close.addEventListener("click", dfMultiFilter.removeToken)
            token.appendChild(token_span);
            token.appendChild(close);
            wrapper.insertBefore(token, search);
        },
        
        
        // Listen for clicks in the dropdown option
        clickDropdown : function(e) {
            const dropdown = e.target;
            const wrapper = dropdown.parentNode.parentNode;
            const input_search = wrapper.querySelector(".selected-input");
            const select = wrapper.querySelector("select");
            dropdown.classList.toggle("active");
        
            if (dropdown.classList.contains("active")) {
                dfMultiFilter.removePlaceholder(wrapper);
                input_search.focus();
        
                if (!input_search.value) {
                    dfMultiFilter.populateAutocompleteList(select, "", true);             
                } else {
                    dfMultiFilter.populateAutocompleteList(select, input_search.value);
                  
                }              
            } else {
                dfMultiFilter.clearAutocompleteList(select);
                dfMultiFilter.addPlaceholder(wrapper);
            }   
      
        },
        
        
        // Clears the results of the autocomplete list
        clearAutocompleteList: function(select) {
            const wrapper = select.parentNode;
        
            const autocomplete_list = wrapper.querySelector(".autocomplete-list");
            autocomplete_list.innerHTML = "";
        },

        populateAutocompleteList: function(select, query, dropdown = false) {
            const {
                autocomplete_options
            } = dfMultiFilter.getOptions(select);
            
            const {
                autocomplete_options_label
            } = dfMultiFilter.getOptions(select);
        
            let options_to_show;

            if (dropdown)
                options_to_show = autocomplete_options;
            else
                options_to_show = dfMultiFilter.autocomplete(query, autocomplete_options);

            const wrapper = select.parentNode;
            const input_search = wrapper.querySelector(".search-container");
            const autocomplete_list = wrapper.querySelector(".autocomplete-list");
            autocomplete_list.innerHTML = "";
            const result_size = options_to_show.length;

            if (result_size == 1) {
        
                const li = document.createElement("li");

                // li.innerText = options_to_show[0];
                li.innerText = autocomplete_options_label[0];

                li.setAttribute('data-value', options_to_show[0]);
                li.addEventListener("click", dfMultiFilter.selectOption);
                autocomplete_list.appendChild(li);
                if (query.length == options_to_show[0].length) {
                    const event = new Event('click');
                    li.dispatchEvent(event);
        
                }
            } else if (result_size > 1) {
                for (let i = 0; i < result_size; i++) {
                    const li = document.createElement("li");

                    // li.innerText = options_to_show[i];
                    li.innerText = autocomplete_options_label[i];

                    li.setAttribute('data-value', options_to_show[i]);
                    li.addEventListener("click", dfMultiFilter.selectOption);
                    autocomplete_list.appendChild(li);
                }
            } else {
                const li = document.createElement("li");
                li.classList.add("not-cursor");
                li.innerText = "No options found";
                autocomplete_list.appendChild(li);
            }
        },
               
        // Listener to autocomplete results when clicked set the selected property in the select option 
        selectOption: function(e){
            const wrapper = e.target.parentNode.parentNode.parentNode;
            const input_search = wrapper.querySelector(".selected-input");
            const option = wrapper.querySelector(`select option[value="${e.target.dataset.value}"]`);
        
            option.setAttribute("selected", "");

            dfMultiFilter.createToken(wrapper, e.target.dataset.value, e.target.innerText);
            // dfMultiFilter.createToken(wrapper, e.target.innerText);

            if (input_search.value) {
                input_search.value = "";
            }
        
            input_search.focus();
        
            e.target.remove();
            const autocomplete_list = wrapper.querySelector(".autocomplete-list");
        
        
            if (!autocomplete_list.children.length) {
                const li = document.createElement("li");
                li.classList.add("not-cursor");
                li.innerText = "No options found";
                autocomplete_list.appendChild(li);
            }
        
            const event = new Event('keyup');
            input_search.dispatchEvent(event);
         
            //the click was outside the specifiedElement, do something
            const dropdown = wrapper.querySelector(".dropdown-icon");
            dropdown.classList.remove("active");
            autocomplete_list.innerHTML = "";
            
            // uniq_el = wrapper.parentNode.parentNode.parentNode.parentNode.parentNode;
             uniq_el = wrapper.parentNode.parentNode.closest('div.difl_cptfilter');
             dfMultiFilter.grid_container = uniq_el.querySelector('.df-cpts-wrap');
             dfMultiFilter.selector = uniq_el.querySelector('.df-cpts-inner-wrap');
             dfMultiFilter.ele_class = uniq_el.classList.value.split(" ").filter(function(class_name){
                 return class_name.indexOf('difl_cptfilter_') !== -1;
             });
             dfMultiFilter.multi_filter_selector = uniq_el.querySelectorAll('.multiple_taxonomy_filter li');
             let multiple_filter_data={};
             multiple_filter_data = jQuery(dfMultiFilter.multi_filter_selector).find('select').map(function() {
            
                 var selected = [...this.options]
                     .filter(option => option.selected && option.value !== 'all')
                     .map(option => option.value);
                     
                return {term_id : selected, texonomy_name: this.name};
            
            
            }).get();  
            const searchValue = null !== dfMultiFilter.search_key  ? dfMultiFilter.search_key.value : '';
            fetch_request( dfMultiFilter.grid_container, dfMultiFilter.ele_class[0], '', dfMultiFilter.selector, JSON.stringify(multiple_filter_data) , 'filter', dfMultiFilter.current_column, searchValue );
            dfMultiFilter.resetDefaultDropdown();
            e.stopPropagation();
        },
        
        
        // function that returns a list with the autcomplete list of matches
        autocomplete: function(query, options) {
            // No query passed, just return entire list
            if (!query) {
                return options;
            }
            let options_return = [];
        
            for (let i = 0; i < options.length; i++) {
                if (query.toLowerCase() === options[i].slice(0, query.length).toLowerCase()) {
                    options_return.push(options[i]);
                }
            }

            return options_return;
        },
        getOptions: function(select){
            // Select all the options available
            const all_options = Array.from(
                select.querySelectorAll("option")
            ).map(el => el.value);
        
            // Get the options that are selected from the user
            const options_selected = Array.from(
                select.querySelectorAll("option:checked")
            ).map(el => el.value);

             // Select all the options label available
             const all_options_label = Array.from(
                select.querySelectorAll("option")
            ).map(el => el.innerText);
        
            // Get the options that are selected from the user
            const options_selected_label = Array.from(
                select.querySelectorAll("option:checked")
            ).map(el => el.innerText);

            // Create an autocomplete options array with the options that are not selected by the user
            const autocomplete_options = [];
            const autocomplete_options_label = [];

            all_options.forEach(option => {
                if (!options_selected.includes(option)) {
                    autocomplete_options.push(option);
                }
            });

            all_options_label.forEach(option => {
                if (!options_selected_label.includes(option)) {
                    autocomplete_options_label.push(option);
                }
            });
        
            autocomplete_options.sort();
            autocomplete_options_label.sort();
        
            return {
                options_selected,
                options_selected_label,
                autocomplete_options_label,
                autocomplete_options
            };
        
        },
        
        // Listener for when the user wants to remove a given token.
        removeToken: function(e) {
            // Get the value to remove
            const value_to_remove = e.target.dataset.option;
            const wrapper = e.target.parentNode.parentNode;
            const input_search = wrapper.querySelector(".selected-input");
            const dropdown = wrapper.querySelector(".dropdown-icon");
            // Get the options in the select to be unselected
            const option_to_unselect = wrapper.querySelector(`select option[value="${value_to_remove}"]`);
            option_to_unselect.removeAttribute("selected");
            // Remove token attribute
            e.target.parentNode.remove();
            input_search.focus();
            dropdown.classList.remove("active");
            const event = new Event('click');
            dropdown.dispatchEvent(event);
            e.stopPropagation();
            const autocomplete_list = wrapper.querySelector(".autocomplete-list");
            //the click was outside the specifiedElement, do something
            dropdown.classList.remove("active");
            autocomplete_list.innerHTML = "";
            // uniq_el = wrapper.parentNode.parentNode.parentNode.parentNode.parentNode;
             uniq_el = wrapper.parentNode.parentNode.closest('div.difl_cptfilter');
             dfMultiFilter.grid_container = uniq_el.querySelector('.df-cpts-wrap');
             dfMultiFilter.selector = uniq_el.querySelector('.df-cpts-inner-wrap');
             dfMultiFilter.ele_class = uniq_el.classList.value.split(" ").filter(function(class_name){
                 return class_name.indexOf('difl_cptfilter_') !== -1;
             });
             dfMultiFilter.multi_filter_selector = uniq_el.querySelectorAll('.multiple_taxonomy_filter li');
             let multiple_filter_data={};
         
             multiple_filter_data = jQuery(dfMultiFilter.multi_filter_selector).find('select').map(function() {
             
                 var selected = [...this.options]
                         .filter(option => option.selected && option.value !=='all')
                         .map(option => option.value);
         
                 return {term_id : selected , texonomy_name: this.name};
             
             
             }).get(); 
             const searchValue = null !== dfMultiFilter.search_key  ? dfMultiFilter.search_key.value : '';
            fetch_request( dfMultiFilter.grid_container, dfMultiFilter.ele_class[0], '', dfMultiFilter.selector, JSON.stringify(multiple_filter_data) , 'filter', dfMultiFilter.current_column,  searchValue );
            dfMultiFilter.resetDefaultDropdown();
        },
        resetDefaultDropdown: function(){
            const select = document.querySelectorAll("[data-multi-select-plugin]");
            var sub_array = [];
            for (let i = 0; i < select.length; i++) {
                if (event) {
                    var isClickInside = select[i].parentElement.parentElement.contains(event.target);
                
                    sub_array.push($(select[i]).val());
                    
                
                    if (!isClickInside) {
                        const wrapper = select[i].parentElement.parentElement;
                        const dropdown = wrapper.querySelector(".dropdown-icon");
                        const autocomplete_list = wrapper.querySelector(".autocomplete-list");
                        //the click was outside the specifiedElement, do something
                        dropdown.classList.remove("active");
                        autocomplete_list.innerHTML = "";
                        dfMultiFilter.addPlaceholder(wrapper);
                    }
                }
            }
        },
        // Listen for 2 sequence of hits on the delete key, if this happens delete the last token if exist
        deletePressed: function(e) {
            const wrapper = e.target.parentNode.parentNode;
            const input_search = e.target;
            const key = e.keyCode || e.charCode;
            const tokens = wrapper.querySelectorAll(".selected-wrapper");
        
            if (tokens.length) {
                const last_token_x = tokens[tokens.length - 1].querySelector("a");
                let hits = +last_token_x.dataset.hits;
        
                if (key == 8 || key == 46) {
                    if (!input_search.value) {
        
                        if (hits > 1) {
                            // Trigger delete event
                            const event = new Event('click');
                            last_token_x.dispatchEvent(event);
                        } else {
                            last_token_x.dataset.hits = 2;
                        }
                    }
                } else {
                    last_token_x.dataset.hits = 0;
                }
            }
            return true;
        },

        addOption: function(target, val, text) {
            const select = document.querySelector(target);
            let opt = document.createElement('option');
            opt.value = val;
            opt.innerHTML = text;
            select.appendChild(opt);
        }
           
    }
    
    var df_cptfilters = document.querySelectorAll('.difl_cptfilter');	

    [].forEach.call(df_cptfilters, function(ele, index){
        var container = ele.querySelector('.df_cptfilter_container');
        var nav = ele.querySelector('.df-cpt-filter-nav');
        var search_input = ele.querySelector('.df_search_filter_input');
        var search_bar_icon = ele.querySelector('.search_bar_button');
        var multiple_filter = ele.querySelectorAll('.multiple_taxonomy_filter li');
        var grid_container = ele.querySelector('.df-cpts-wrap');
        var selector = ele.querySelector('.df-cpts-inner-wrap');
        var ele_class = ele.classList.value.split(" ").filter(function(class_name){
            return class_name.indexOf('difl_cptfilter_') !== -1;
        });
		var column = df_cpt_filter[ele_class[0]].column;
		var column_tablet = df_cpt_filter[ele_class[0]].column_tablet ? df_cpt_filter[ele_class[0]].column_tablet : column;
		var column_phone = df_cpt_filter[ele_class[0]].column_phone ? df_cpt_filter[ele_class[0]].column_phone : column_tablet;
		
		var current_column = get_column(column, column_tablet, column_phone);
		
		window.addEventListener('resize', function(){ 
			current_column = get_column(column, column_tablet, column_phone);
		})
				
        var rowInfo = {
            row : 1,
            top: 0
        };

        if(!grid_container) return;

        var iso = new Isotope(selector, {
            layoutMode: df_cpt_filter[ele_class[0]].layout,
            itemSelector: '.df-cpt-item',
            percentPosition: true,
            stagger: 60
        });
        // fix the lazy load layout issue
        var entries = selector.querySelectorAll('.df-cpt-item');
        observer = new IntersectionObserver(function (item) {
            iso.layout();
        });
        
        [].forEach.call(entries, function (v){
            observer.observe( v );
        });      
        // *****************

        setTimeout(function(){
            iso.layout();
            grid_container.parentNode.classList.add('load-complete');
        }, 500);
		
		if( df_cpt_filter[ele_class[0]].equal_height === 'on' ) {
			document.addEventListener( "DOMContentLoaded", function() {
				calRowClass( selector, selector.querySelectorAll('.df-cpt-item'), current_column );
			} )
		}
		
		window.addEventListener('resize', function(){
			calRowClass( selector, selector.querySelectorAll('.df-cpt-item'), current_column );
		})
        
        // filter buttons on click
        if(nav){
            nav.addEventListener('click', function(e){
                if(e.target.nodeName === 'LI') {
                    var term_id = e.target.dataset.term;
                    if(!e.target.classList.contains('df-active')) {
                        df_filter_btn_active_state(nav, e.target);                  
                        const search_key = null !== search_input ? search_input.value: '' ;
                        fetch_request( grid_container, ele_class[0], term_id, selector, df_cpt_filter[ele_class[0]].selected_tax, 'filter', current_column , search_key );
                    } 
                }
            })
        }
    
        if(search_input && search_bar_icon){
        
            search_bar_icon.addEventListener('click' , function(e){
                if(e.isTrusted && search_input.value === ''){
                    return;
                }
                // disable click for 1sec
                const clickSpan = $('.search_bar_button')
                clickSpan.css('pointer-events', 'none')
                setTimeout(() => {
                    clickSpan.css('pointer-events', 'auto')
                }, 1000)

                let term_id = '';
                if(nav){
                    const  activeList = e.target.parentNode.parentNode.parentNode.querySelector('.df-cpt-filter-nav li.df-active');
                     term_id = activeList && activeList.dataset.term ? activeList.dataset.term : '' ;
                }else{
                    term_id = '';
                }          
                const multi_filter_selector = e.target.parentNode.parentNode.querySelectorAll('.multiple_taxonomy_filter li');

               
                let multiple_filter_data={};
                if(multi_filter_selector){
                    multiple_filter_data = jQuery(multi_filter_selector).find('select').map(function() {
                
                        var selected = [...this.options]
                                .filter(option => option.selected && option.value !=='all')
                                .map(option => option.value);
                
                        return {term_id : selected , texonomy_name: this.name};
                    
                    
                    }).get(); 
                }
          
                const selected_data = nav ? df_cpt_filter[ele_class[0]].selected_tax : JSON.stringify(multiple_filter_data);
                const search_input_value = search_input.value;
                if(search_input_value.length > 0) { 
                    fetch_request( grid_container, ele_class[0], term_id , selector, selected_data , 'filter', current_column , search_input_value);
                } else{
                    fetch_request( grid_container, ele_class[0], term_id , selector, selected_data , 'filter', current_column);
                }

            })

            search_input.addEventListener('keypress', function(event){
                if (event.key === "Enter" &&  '' !== event.target.value) {
                    event.preventDefault();
                    search_bar_icon.click();
                }
                            
            })
            search_input.addEventListener('keyup', function(ev){
                  if(ev.target.value === '' && ev.key !== "Enter"){
                    ev.preventDefault();
                    search_bar_icon.click();
                  }
            })
        }
        // load more button on click
        grid_container.addEventListener('click', function(e) {
            if(e.target.className === "df-cptfilter-load-more") {
                e.preventDefault();
                var term_id = e.target.dataset.term;
                var texonomy_list = term_id !=='' ? df_cpt_filter[ele_class[0]].selected_tax : e.target.dataset.multiple_texonomy; // Check multi texonomy filter or normar filter
                fetch_request( grid_container, ele_class[0], term_id, selector, texonomy_list, 'loadmore', current_column );
            }
        })
     
        let items = [];

        document.addEventListener("DOMContentLoaded", () => {

            // get select that has the options available
            const select1 = container.querySelectorAll("[data-multi-select-plugin]");
            select1.forEach(select => {
                dfMultiFilter.init(select , ele , current_column ,search_input);
            });

            // Dismiss on outside click
            document.addEventListener('click', () => {
                // get select that has the options available
                const select = document.querySelectorAll("[data-multi-select-plugin]");

                if(select){
                    dfMultiFilter.resetDefaultDropdown();
                }
            
            });
        
        });
  
    })
	

    /**
     * Make fetch request and pull data 
     * by post type slug
     * 
     * @param {String} grid_container
     * @param {String} ele_class
     * @param {INT} term_id
     * @param {Object} selector
     * @param {String} _request | loadmore or filter 
     */
    function fetch_request( grid_container, ele_class, term_id, selector, selected_tax, _request = 'loadmore', current_column , search_value = '' ) {
        var load_more = df_cpt_filter[ele_class].load_more;
        var ajaxurl = window.et_pb_custom.ajaxurl;
        var load_more_btn = grid_container.querySelector('.df-cptfilter-load-more');
        var load_more_btn_container = grid_container.querySelector('.load-more-pagintaion-container');
        var page = _request === 'filter' ? 1 : load_more_btn.dataset.current;
        var iso = Isotope.data(selector);
        //selecting loading div
        const loader = grid_container.querySelector("#df_loading");
  
        // showing loading
        function displayLoading() {
            loader.classList.add("display");
            // to stop loading after some time
            setTimeout(() => {
                loader.classList.remove("display");
            }, 5000);
        }
        
        // hiding loading 
        function hideLoading() {
            loader.classList.remove("display");
        }
        grid_container.parentNode.classList.add('df-filter-loading');
        grid_container.parentNode.classList.remove('load-complete');
        if(df_cpt_filter[ele_class].loader_spining === 'on'){
            displayLoading()
        }
       
        let sarch_key = search_value;
        fetch(ajaxurl, {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cache-Control': 'no-cache',
            },
            body: new URLSearchParams({
                et_frontend_nonce: window.et_pb_custom.et_frontend_nonce,
                action: 'df_cpt_filter_data',
                term_id: term_id,
                post_type: df_cpt_filter[ele_class].post_type,
                post_display: df_cpt_filter[ele_class].post_display,
                posts_number: df_cpt_filter[ele_class].posts_number,
                equal_height: df_cpt_filter[ele_class].equal_height,
                use_image_as_background: df_cpt_filter[ele_class].use_image_as_background,
                use_background_scale: df_cpt_filter[ele_class].use_background_scale,
                use_number_pagination: df_cpt_filter[ele_class].use_number_pagination,
                show_pagination: df_cpt_filter[ele_class].show_pagination,
                older_text: df_cpt_filter[ele_class].older_text,
                newer_text: df_cpt_filter[ele_class].newer_text,
                cpt_item_inner: df_cpt_filter[ele_class].cpt_item_inner,
                cpt_item_outer: df_cpt_filter[ele_class].cpt_item_outer,
                load_more: load_more,
                use_load_more_icon: df_cpt_filter[ele_class].use_load_more_icon,
                load_more_font_icon: df_cpt_filter[ele_class].load_more_font_icon,
                load_more_icon_pos: df_cpt_filter[ele_class].load_more_icon_pos,
                use_load_more_text: df_cpt_filter[ele_class].use_load_more_text,
                use_empty_post_message: df_cpt_filter[ele_class].use_empty_post_message,
                empty_post_message: df_cpt_filter[ele_class].empty_post_message,   
                all_items: df_cpt_filter[ele_class].all_items,
                current_page: page,
                selected_tax: selected_tax,
                multi_filter_type: df_cpt_filter[ele_class].multi_filter_type,
                search_value: sarch_key,
                _request: _request,
                orderby: df_cpt_filter[ele_class].orderby
            })
        })
        .then(function(response){ 
            if(_request === 'filter') {
                iso.remove(iso.getItemElements())
                iso.reloadItems()
            }
            return response.json()
         })
        .then(function(response){
            var parser = new DOMParser();
            var parsedHtml = parser.parseFromString(response.data, 'text/html');
            var items = parsedHtml.querySelectorAll('.df-cpt-item');
                   
            var update_load_more = parsedHtml.querySelector('.load-more-pagintaion-container');
            iso = Isotope.data(selector);
            if(_request === 'filter') {
           
                if( document.querySelector('.no-post') ) {
                    const noPost = document.querySelector('.no-post');
                    selector.removeChild(noPost);
                    
                    grid_container.classList.remove('no-post-container');
                }
                if(items.length > 0){
                
                    items.forEach(function(item){
                        selector.appendChild(item);
                    })

                }else{
                    const noPost = parsedHtml.querySelector('.no-post');
                    selector.appendChild(noPost);
                    grid_container.classList.add('no-post-container');
                    
                }
        
             
                if(load_more_btn_container) {
                    load_more_btn_container.remove();
                }
                if(update_load_more) {

                    grid_container.appendChild(update_load_more);
                    var loadMoreButton = grid_container.querySelector('.load-more-pagintaion-container a.df-cptfilter-load-more');
                    loadMoreButton.setAttribute('data-multiple_texonomy' , selected_tax );

                }
                // settings the css valiable to default
                
            } else {
                items.forEach(function(item){
                    selector.appendChild(item);
                })
                load_more_btn.setAttribute("data-current", (parseInt(page)+1))

                if( parseInt(load_more_btn.dataset.current) >= parseInt(load_more_btn.dataset.pages) ) {
                    load_more_btn.style.display="none";
                }
                load_more_btn.style.opacity = '1';
                load_more_btn.style.pointerEvents = 'all';

            }
            // data is processed and new item added to container.
            iso.appended(items)
            return items;
        })
        .then(function( items ) {
            // refresing the layout in case the layout not positions properly.
            iso = Isotope.data( selector );
            
            if( df_cpt_filter[ele_class].equal_height === 'on' && _request === 'loadmore' ) {
                setTimeout( function(){
                    calRowClass( selector, selector.querySelectorAll('.df-cpt-item'), current_column );
                }, 50 );
                setTimeout( function(){
                    iso.layout();
                }, 100 );

            } else if( df_cpt_filter[ele_class].equal_height === 'on' && _request === 'filter' ) {
                setTimeout( function(){
					calRowClass( selector, items, current_column );
                }, 50 );
                setTimeout( function(){
                    iso.layout();
                }, 100 );
            } else {
                setTimeout( function(){
                    iso.layout();
                }, 100 );
            }

            // loading is completed
            grid_container.parentNode.classList.remove( 'df-filter-loading' );
            grid_container.parentNode.classList.add( 'load-complete' );
            if(df_cpt_filter[ele_class].loader_spining === 'on'){
                hideLoading()
            }
          
        }) 
    }
	
	/**
	 * Get column by device and window width
	 * 
	 * 
	 */
	 function get_column(column, column_tablet, column_phone) {
		 var current = column;
		 
		 if (window.innerWidth <= 767 ) {
			 current = column_phone;
		 } else if (window.innerWidth <= 980) {
			 current = column_tablet;
		 }
		 		 
		 return current;
	 }

    /**
     * Change the active nav button
     * on click event
     * 
     * @param {Object} nav_container | Filter nav container
     * @param {Object} nav_item | Selected nav item 
     */
    function df_filter_btn_active_state(nav_container, nav_item) {
        var nav_items = nav_container.querySelectorAll('.df-cpt-filter-nav-item');
        [].map.call(nav_items, function(nav_item) {
            nav_item.classList.remove('df-active');
        })
        nav_item.classList.add('df-active');
    }
	
	/**
     * Calculate the row class and
     * apply row height to each element.
     * 
     * @param Selector
     * @param elements
     * @param column
     */
	function calRowClass( selector, elements, column ) {
		
		var row = 1;
		var count = 1;
		var rowArray = [];
		
		[].forEach.call( elements, function( element ) {
			row = Math.ceil(count / column);
			
			var exis = element.classList.value.split(" ").filter(function(class_name){
				return class_name.indexOf('cpt-item-row-') !== -1;
			});
			if( exis.length !== 0 ) {
				element.classList.remove(exis)
			}
			
			element.classList.add( 'cpt-item-row-' + row );
						
			if (!rowArray.includes(row)) {
    			rowArray.push(row);
			}
			count++;
		})
				
		for( var i = 0; i < rowArray.length; i++ ) {
            rowHeight( selector, 'cpt-item-row-' + rowArray[i], elements );
        }
        row = 1;
		rowArray = [];	
	}

    /**
     * Apply equal height to elements
     * 
     */
    function equalHeight( selector, elements, rowInfo ) {
        var row = rowInfo.row;
        var top = 0;
        [].forEach.call( elements, function( element ) {
            
            var style = getComputedStyle( element );
            var itemTop = parseInt( style.getPropertyValue( 'top' ) );

            if( itemTop == top ) {
                element.classList.add( 'cpt-item-row-' + row );
            } else {
                top = itemTop;
                row++;
                element.classList.add( 'cpt-item-row-' + row );
            }

        } )

        for( var i = rowInfo.row; i <= row; i++ ) {
            rowHeight( selector, 'cpt-item-row-' + i );
        }
        rowInfo.row = row;
        rowInfo.top = top;
    }
    
    /**
     * Get the row max-height and
     * apply to each row item
     * 
     */
    function rowHeight( selector, rowClass, elements ) {		
		var rowElements = [...elements].filter(element => element.classList.contains(rowClass));
				
        var height = [];

        [].forEach.call( rowElements, function( rowElement ) {
            var style = getComputedStyle( rowElement );
            var rowElementHeight = parseInt( style.getPropertyValue( 'height' ) );
            height.push( rowElementHeight );
        } );
		
        $( selector ).find( `.${rowClass}` ).css( 'min-height', Math.max(...height) );
    }

})( jQuery )

