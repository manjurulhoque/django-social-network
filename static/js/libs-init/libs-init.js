CRUMINA.Bootstrap = function () {
    $('[data-toggle="tooltip"], [rel="tooltip"]').tooltip(), $('[data-toggle="popover"]').popover(), $(".selectpicker").selectpicker();
    var e = $('input[name="birthdayyy"]');
    if (e.length) {
        // var i = moment().subtract(29, "days");
        var i = moment();
        if(e[0].value) i = e[0].value;
        e.daterangepicker({
            minDate: "12/05/1900",
            startDate: i,
            autoUpdateInput: !1,
            singleDatePicker: !0,
            showDropdowns: !0,
            locale: {format: "DD/MM/YYYY"}
        }), e.on("focus", (function () {
            $(this).closest(".form-group").addClass("is-focused")
        })), e.on("apply.daterangepicker", (function (e, i) {
            $(this).val(i.startDate.format("DD/MM/YYYY")), $(this).closest(".form-group").addClass("is-focused")
        })), e.on("hide.daterangepicker", (function () {
            "" === $(this).val() && $(this).closest(".form-group").removeClass("is-focused")
        }))
    }
}, $(document).ready((function () {
    CRUMINA.Bootstrap()
})), CRUMINA.FormValidation = function () {
    $(".needs-validation").each((function () {
        var e = $(this)[0];
        e.addEventListener("submit", (function (i) {
            0 == e.checkValidity() && (i.preventDefault(), i.stopPropagation()), e.classList.add("was-validated")
        }), !1)
    }))
}, $(document).ready((function () {
    CRUMINA.FormValidation()
})), CRUMINA.fullCalendar = function () {
    var e = document.getElementById("calendar");
    new FullCalendar.Calendar(e, {
        plugins: ["interaction", "dayGrid", "timeGrid"],
        defaultView: "dayGridMonth",
        defaultDate: "2019-05-07",
        header: {left: "prev", center: "title", right: "next,dayGridMonth,timeGridWeek,timeGridDay"},
        buttonText: {month: " ", week: " ", day: " "},
        buttonIcons: {prev: "far fa-chevron-left", next: "far fa-chevron-right"},
        eventClick: function (e) {
            var i = e.event.url.match(/^modal\:(#[-\w]+)$/);
            if (i) {
                e.jsEvent.preventDefault();
                var a = i[1];
                $(a).modal("show")
            }
        },
        events: [{
            title: "Chris Greyson’s Bday",
            start: "2019-05-08",
            url: "modal:#public-event"
        }, {
            title: "Make Dinner Plans...",
            start: "2019-05-08",
            url: "modal:#private-event"
        }, {
            title: "Jenny’s Birthday...",
            start: "2019-05-30",
            url: "modal:#private-event"
        }, {
            title: "Videocall to talk...",
            start: "2019-05-30",
            url: "modal:#public-event"
        }, {title: "Breakfast at the...", start: "2019-05-26", url: "modal:#public-event"}, {
            title: "Send the new...",
            start: "2019-05-26",
            url: "modal:#private-event"
        }, {title: "Take Querty to the...", start: "2019-05-26", url: "modal:#public-event"}]
    }).render()
}, $(document).ready((function () {
    $("#calendar").length > 0 && CRUMINA.fullCalendar()
})), $(document).ready((function () {
    var e = $("#header--standard");
    e.length && e.headroom({
        offset: 100,
        tolerance: 5,
        classes: {initial: "animated", pinned: "slideDown", unpinned: "slideUp"}
    })
})), CRUMINA.rangeSlider = function () {
    $(".range-slider-js").ionRangeSlider({type: "double", grid: !0, min: 0, max: 1e3, from: 200, to: 800, prefix: "$"})
}, $(document).ready((function () {
    CRUMINA.rangeSlider()
})), CRUMINA.IsotopeSort = function () {
    $(".sorting-container").each((function () {
        var e = $(this), i = e.data("layout").length ? e.data("layout") : "masonry";
        e.isotope({
            itemSelector: ".sorting-item",
            layoutMode: i,
            percentPosition: !0
        }), e.imagesLoaded().progress((function () {
            e.isotope("layout")
        })), e.siblings(".sorting-menu").find("li").on("click", (function () {
            if ($(this).hasClass("active")) return !1;
            $(this).parent().find(".active").removeClass("active"), $(this).addClass("active");
            var i = $(this).data("filter");
            return void 0 !== i ? (e.isotope({filter: i}), !1) : void 0
        }))
    }))
}, $(document).ready((function () {
    CRUMINA.IsotopeSort()
})), $(document).ready((function () {
    var e = $(".skills-item");
    e.each((function () {
        e.appear({force_process: !0}), e.on("appear", (function () {
            var e = $(this);
            e.data("inited") || (e.find(".skills-item-meter-active").fadeTo(300, 1).addClass("skills-animate"), e.data("inited", !0))
        }))
    }))
})), CRUMINA.mediaPopups = function () {
    $(".play-video").magnificPopup({
        // disableOn: 700,
        // type: "iframe",
        // mainClass: "mfp-fade",
        // removalDelay: 160,
        // preloader: !1,
        // fixedContentPos: !1
        type: 'inline',
        midClick: true,
        showCloseBtn: true,
        callbacks: {
            open: function () {
                var html = "<button title='Close (Esc)' type='button' style='font-size: 30px !important; color: #ffffff' class='mfp-close'></button>";
                $('.modifyDialog').append(html);
            },
            // open: function () {
            //     $('html').css('margin-right', 0);
            //     // Play video on open:
            //     $(this.content).find('video')[0].play();
            // },
            close: function () {
                // Reset video on close:
                $(this.content).find('video')[0].load();
            }
        }
    }),
        $(".js-zoom-image").magnificPopup({
            type: "image", removalDelay: 500, callbacks: {
                beforeOpen: function () {
                    this.st.image.markup = this.st.image.markup.replace("mfp-figure", "mfp-figure mfp-with-anim"), this.st.mainClass = "mfp-zoom-in"
                }
            }, closeOnContentClick: !0, midClick: !0
        }),
        $(".js-zoom-gallery").each((function () {
            $(this).magnificPopup({
                delegate: "a",
                type: "image",
                gallery: {enabled: !0},
                removalDelay: 500,
                callbacks: {
                    beforeOpen: function () {
                        this.st.image.markup = this.st.image.markup.replace("mfp-figure", "mfp-figure mfp-with-anim"), this.st.mainClass = "mfp-zoom-in"
                    }
                },
                closeOnContentClick: !0,
                midClick: !0
            })
        }))
}, $(document).ready((function () {
    void 0 !== $.fn.magnificPopup && CRUMINA.mediaPopups()
})), CRUMINA.equalHeight = function () {
    $(".js-equal-child").find(".theme-module").matchHeight({property: "min-height"})
}, $(document).ready((function () {
    void 0 !== $.fn.matchHeight && CRUMINA.equalHeight()
})), CRUMINA.Materialize = function () {
    // $.material.init(), $(".checkbox > label").on("click", (function () {
    //     $(this).closest(".checkbox").addClass("clicked")
    // }))
}, $(document).ready((function () {
    CRUMINA.Materialize()
})), $(document).ready((function () {
    var e = $(".js-user-search");
    e.length && e.selectize({
        delimiter: ",",
        persist: !1,
        maxItems: 2,
        valueField: "name",
        labelField: "name",
        searchField: ["name"],
        options: [{
            image: "img/avatar30-sm.jpg",
            name: "Marie Claire Stevens",
            message: "12 Friends in Common",
            icon: "olymp-happy-face-icon"
        }, {
            image: "img/avatar54-sm.jpg",
            name: "Marie Davidson",
            message: "4 Friends in Common",
            icon: "olymp-happy-face-icon"
        }, {
            image: "img/avatar49-sm.jpg",
            name: "Marina Polson",
            message: "Mutual Friend: Mathilda Brinker",
            icon: "olymp-happy-face-icon"
        }, {
            image: "img/avatar36-sm.jpg",
            name: "Ann Marie Gibson",
            message: "New York, NY",
            icon: "olymp-happy-face-icon"
        }, {
            image: "img/avatar22-sm.jpg",
            name: "Dave Marinara",
            message: "8 Friends in Common",
            icon: "olymp-happy-face-icon"
        }, {
            image: "img/avatar41-sm.jpg",
            name: "The Marina Bar",
            message: "Restaurant / Bar",
            icon: "olymp-star-icon"
        }],
        render: {
            option: function (e, i) {
                return '<div class="inline-items">' + (e.image ? '<div class="author-thumb"><img src="' + i(e.image) + '" alt="avatar"></div>' : "") + '<div class="notification-event">' + (e.name ? '<span class="h6 notification-friend"></a>' + i(e.name) + "</span>" : "") + (e.message ? '<span class="chat-message-item">' + i(e.message) + "</span>" : "") + "</div>" + (e.icon ? '<span class="notification-icon"><svg class="' + i(e.icon) + '"><use xlink:href="icons/icons.svg#' + i(e.icon) + '"></use></svg></span>' : "") + "</div>"
            }, item: function (e, i) {
                return '<div><span class="label">' + i(e.name) + "</span></div>"
            }
        }
    })
})), CRUMINA.StickySidebar = function () {
    var e = $("#site-header");
    $(".crumina-sticky-sidebar").each((function () {
        new StickySidebar(this, {
            topSpacing: e.height(),
            bottomSpacing: 0,
            containerSelector: !1,
            innerWrapperSelector: ".sidebar__inner",
            resizeSensor: !0,
            stickyClass: "is-affixed",
            minWidth: 0
        })
    }))
}, $(document).ready((function () {
    CRUMINA.StickySidebar()
}));
var swipers = {};
$(document).ready((function () {
    var e = 0, i = !1;
    $(".swiper-container").each((function () {
        var a = $(this), t = "swiper-unique-id-" + e;
        a.addClass("swiper-" + t + " initialized").attr("id", t), a.find(".swiper-pagination").addClass("pagination-" + t);
        var n = a.data("effect") ? a.data("effect") : "slide", s = !a.data("crossfade") || a.data("crossfade"),
            o = 0 != a.data("loop") || a.data("loop"), r = a.data("show-items") ? a.data("show-items") : 1,
            l = a.data("scroll-items") ? a.data("scroll-items") : 1,
            c = a.data("direction") ? a.data("direction") : "horizontal",
            d = !!a.data("mouse-scroll") && a.data("mouse-scroll"),
            m = a.data("autoplay") ? parseInt(a.data("autoplay"), 10) : 0, p = !!a.hasClass("auto-height"),
            u = r > 1 ? 20 : 0;
        r > 1 && (i = {
            480: {slidesPerView: 1, slidesPerGroup: 1},
            768: {slidesPerView: 2, slidesPerGroup: 2}
        }), swipers["swiper-" + t] = new Swiper(".swiper-" + t, {
            pagination: ".pagination-" + t,
            paginationClickable: !0,
            direction: c,
            mousewheelControl: d,
            mousewheelReleaseOnEdges: d,
            slidesPerView: r,
            slidesPerGroup: l,
            spaceBetween: u,
            keyboardControl: !0,
            setWrapperSize: !0,
            preloadImages: !0,
            updateOnImagesReady: !0,
            autoplay: m,
            autoHeight: p,
            loop: o,
            breakpoints: i,
            effect: n,
            fade: {crossFade: s},
            parallax: !0,
            onSlideChangeStart: function (e) {
                var i = a.siblings(".slider-slides");
                if (i.length) {
                    i.find(".slide-active").removeClass("slide-active");
                    var t = e.slides.eq(e.activeIndex).attr("data-swiper-slide-index");
                    i.find(".slides-item").eq(t).addClass("slide-active")
                }
            }
        }), e++
    })), $(".btn-prev").on("click", (function () {
        var e = $(this).closest(".slider-slides").siblings(".swiper-container").attr("id");
        swipers["swiper-" + e].slidePrev()
    })), $(".btn-next").on("click", (function () {
        var e = $(this).closest(".slider-slides").siblings(".swiper-container").attr("id");
        swipers["swiper-" + e].slideNext()
    })), $(".btn-prev-without").on("click", (function () {
        var e = $(this).closest(".swiper-container").attr("id");
        swipers["swiper-" + e].slidePrev()
    })), $(".btn-next-without").on("click", (function () {
        var e = $(this).closest(".swiper-container").attr("id");
        swipers["swiper-" + e].slideNext()
    })), $(".slider-slides .slides-item").on("click", (function () {
        if ($(this).hasClass("slide-active")) return !1;
        var e = $(this).parent().find(".slides-item").index(this),
            i = $(this).closest(".slider-slides").siblings(".swiper-container").attr("id");
        return swipers["swiper-" + i].slideTo(e + 1), $(this).parent().find(".slide-active").removeClass("slide-active"), $(this).addClass("slide-active"), !1
    }))
})), $(document).ready((function () {
    var e = $(".counter");
    e.length && e.each((function () {
        jQuery(this).waypoint((function () {
            $(this.element).find("span").countTo(), this.destroy()
        }), {offset: "95%"})
    }))
})), CRUMINA.maps = {
    maps: {
        mapUSA: {
            config: {
                id: "map",
                map: {
                    center: new L.LatLng(38.897663, -77.036575),
                    zoom: 12,
                    maxZoom: 18,
                    layers: new L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
                        maxZoom: 16,
                        attribution: ""
                    })
                },
                icon: {iconSize: [36, 54], iconAnchor: [22, 94], className: "icon-map"}
            }, markers: [{coords: [38.897663, -77.036575], icon: "map-marker.png"}]
        }
    }, init: function () {
        for (var e in this.maps) {
            var i = this.maps[e];
            if (i.config && i.markers && document.getElementById(i.config.id)) {
                var a = new L.map(i.config.id, i.config.map), t = L.markerClusterGroup({
                    iconCreateFunction: function (a) {
                        var t = a.getChildCount(), n = i.config.cluster;
                        return new L.DivIcon({
                            html: "<div><span>" + t + "</span></div>",
                            className: "marker-cluster marker-cluster-" + e,
                            iconSize: new L.Point(n.iconSize[0], n.iconSize[1])
                        })
                    }
                });
                i.markers.forEach((function (e) {
                    i.config.icon.iconUrl = "./img/" + e.icon;
                    var a = L.icon(i.config.icon), n = L.marker(e.coords, {icon: a});
                    t.addLayer(n)
                })), a.addLayer(t), this.disableScroll(jQuery("#" + i.config.id), a)
            }
        }
    }, disableScroll: function (e, i) {
        i.scrollWheelZoom.disable(), e.bind("mousewheel DOMMouseScroll", (function (e) {
            e.stopPropagation(), 1 == e.ctrlKey ? (e.preventDefault(), i.scrollWheelZoom.enable(), setTimeout((function () {
                i.scrollWheelZoom.disable()
            }), 1e3)) : i.scrollWheelZoom.disable()
        }))
    }
}, $(document).ready((function () {
    CRUMINA.maps.init()
}));
