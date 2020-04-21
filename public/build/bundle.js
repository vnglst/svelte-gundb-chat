
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty$1() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    function create_animation(node, from, fn, params) {
        if (!from)
            return noop;
        const to = node.getBoundingClientRect();
        if (from.left === to.left && from.right === to.right && from.top === to.top && from.bottom === to.bottom)
            return noop;
        const { delay = 0, duration = 300, easing = identity, 
        // @ts-ignore todo: should this be separated from destructuring? Or start/end added to public api and documentation?
        start: start_time = now() + delay, 
        // @ts-ignore todo:
        end = start_time + duration, tick = noop, css } = fn(node, { from, to }, params);
        let running = true;
        let started = false;
        let name;
        function start() {
            if (css) {
                name = create_rule(node, 0, 1, duration, delay, easing, css);
            }
            if (!delay) {
                started = true;
            }
        }
        function stop() {
            if (css)
                delete_rule(node, name);
            running = false;
        }
        loop(now => {
            if (!started && now >= start_time) {
                started = true;
            }
            if (started && now >= end) {
                tick(1, 0);
                stop();
            }
            if (!running) {
                return false;
            }
            if (started) {
                const p = now - start_time;
                const t = 0 + 1 * easing(p / duration);
                tick(t, 1 - t);
            }
            return true;
        });
        start();
        tick(0, 1);
        return stop;
    }
    function fix_position(node) {
        const style = getComputedStyle(node);
        if (style.position !== 'absolute' && style.position !== 'fixed') {
            const { width, height } = style;
            const a = node.getBoundingClientRect();
            node.style.position = 'absolute';
            node.style.width = width;
            node.style.height = height;
            add_transform(node, a);
        }
    }
    function add_transform(node, a) {
        const b = node.getBoundingClientRect();
        if (a.left !== b.left || a.top !== b.top) {
            const style = getComputedStyle(node);
            const transform = style.transform === 'none' ? '' : style.transform;
            node.style.transform = `${transform} translate(${a.left - b.left}px, ${a.top - b.top}px)`;
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function beforeUpdate(fn) {
        get_current_component().$$.before_update.push(fn);
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function fix_and_outro_and_destroy_block(block, lookup) {
        block.f();
        outro_and_destroy_block(block, lookup);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next, lookup.has(block.key));
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error(`Cannot have duplicate keys in a keyed each`);
            }
            keys.add(key);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.20.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    function createUser() {
      const initialUser = JSON.parse(sessionStorage.getItem("chat_user"));

      const { subscribe, update, set } = writable(initialUser);

      subscribe((newUser) => {
        sessionStorage.setItem("chat_user", JSON.stringify(newUser));
      });

      return {
        subscribe,
        update,
        set,
      };
    }

    const user = createUser();

    function createNav() {
      const { subscribe, update, set } = writable("messages");

      return {
        subscribe,
        update,
        set,
      };
    }

    const nav = createNav();

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }
    function quintOut(t) {
        return --t * t * t * t * t + 1;
    }

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */

    function __rest(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }
    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }
    function crossfade(_a) {
        var { fallback } = _a, defaults = __rest(_a, ["fallback"]);
        const to_receive = new Map();
        const to_send = new Map();
        function crossfade(from, node, params) {
            const { delay = 0, duration = d => Math.sqrt(d) * 30, easing = cubicOut } = assign(assign({}, defaults), params);
            const to = node.getBoundingClientRect();
            const dx = from.left - to.left;
            const dy = from.top - to.top;
            const dw = from.width / to.width;
            const dh = from.height / to.height;
            const d = Math.sqrt(dx * dx + dy * dy);
            const style = getComputedStyle(node);
            const transform = style.transform === 'none' ? '' : style.transform;
            const opacity = +style.opacity;
            return {
                delay,
                duration: is_function(duration) ? duration(d) : duration,
                easing,
                css: (t, u) => `
				opacity: ${t * opacity};
				transform-origin: top left;
				transform: ${transform} translate(${u * dx}px,${u * dy}px) scale(${t + (1 - t) * dw}, ${t + (1 - t) * dh});
			`
            };
        }
        function transition(items, counterparts, intro) {
            return (node, params) => {
                items.set(params.key, {
                    rect: node.getBoundingClientRect()
                });
                return () => {
                    if (counterparts.has(params.key)) {
                        const { rect } = counterparts.get(params.key);
                        counterparts.delete(params.key);
                        return crossfade(rect, node, params);
                    }
                    // if the node is disappearing altogether
                    // (i.e. wasn't claimed by the other list)
                    // then we need to supply an outro
                    items.delete(params.key);
                    return fallback && fallback(node, params, intro);
                };
            };
        }
        return [
            transition(to_send, to_receive, false),
            transition(to_receive, to_send, true)
        ];
    }

    function flip(node, animation, params) {
        const style = getComputedStyle(node);
        const transform = style.transform === 'none' ? '' : style.transform;
        const scaleX = animation.from.width / node.clientWidth;
        const scaleY = animation.from.height / node.clientHeight;
        const dx = (animation.from.left - animation.to.left) / scaleX;
        const dy = (animation.from.top - animation.to.top) / scaleY;
        const d = Math.sqrt(dx * dx + dy * dy);
        const { delay = 0, duration = (d) => Math.sqrt(d) * 120, easing = cubicOut } = params;
        return {
            delay,
            duration: is_function(duration) ? duration(d) : duration,
            easing,
            css: (_t, u) => `transform: ${transform} translate(${u * dx}px, ${u * dy}px);`
        };
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var gun = createCommonjsModule(function (module) {
    (function(){

      /* UNBUILD */
      var root;
      if(typeof window !== "undefined"){ root = window; }
      if(typeof commonjsGlobal !== "undefined"){ root = commonjsGlobal; }
      root = root || {};
      var console = root.console || {log: function(){}};
      function USE(arg, req){
        return req? commonjsRequire() : arg.slice? USE[R(arg)] : function(mod, path){
          arg(mod = {exports: {}});
          USE[R(path)] = mod.exports;
        }
        function R(p){
          return p.split('/').slice(-1).toString().replace('.js','');
        }
      }
      { var common = module; }
    USE(function(module){
    		// Generic javascript utilities.
    		var Type = {};
    		//Type.fns = Type.fn = {is: function(fn){ return (!!fn && fn instanceof Function) }}
    		Type.fn = {is: function(fn){ return (!!fn && 'function' == typeof fn) }};
    		Type.bi = {is: function(b){ return (b instanceof Boolean || typeof b == 'boolean') }};
    		Type.num = {is: function(n){ return !list_is(n) && ((n - parseFloat(n) + 1) >= 0 || Infinity === n || -Infinity === n) }};
    		Type.text = {is: function(t){ return (typeof t == 'string') }};
    		Type.text.ify = function(t){
    			if(Type.text.is(t)){ return t }
    			if(typeof JSON !== "undefined"){ return JSON.stringify(t) }
    			return (t && t.toString)? t.toString() : t;
    		};
    		Type.text.random = function(l, c){
    			var s = '';
    			l = l || 24; // you are not going to make a 0 length random number, so no need to check type
    			c = c || '0123456789ABCDEFGHIJKLMNOPQRSTUVWXZabcdefghijklmnopqrstuvwxyz';
    			while(l > 0){ s += c.charAt(Math.floor(Math.random() * c.length)); l--; }
    			return s;
    		};
    		Type.text.match = function(t, o){ var tmp, u;
    			if('string' !== typeof t){ return false }
    			if('string' == typeof o){ o = {'=': o}; }
    			o = o || {};
    			tmp = (o['='] || o['*'] || o['>'] || o['<']);
    			if(t === tmp){ return true }
    			if(u !== o['=']){ return false }
    			tmp = (o['*'] || o['>'] || o['<']);
    			if(t.slice(0, (tmp||'').length) === tmp){ return true }
    			if(u !== o['*']){ return false }
    			if(u !== o['>'] && u !== o['<']){
    				return (t > o['>'] && t < o['<'])? true : false;
    			}
    			if(u !== o['>'] && t > o['>']){ return true }
    			if(u !== o['<'] && t < o['<']){ return true }
    			return false;
    		};
    		Type.list = {is: function(l){ return (l instanceof Array) }};
    		Type.list.slit = Array.prototype.slice;
    		Type.list.sort = function(k){ // creates a new sort function based off some key
    			return function(A,B){
    				if(!A || !B){ return 0 } A = A[k]; B = B[k];
    				if(A < B){ return -1 }else if(A > B){ return 1 }
    				else { return 0 }
    			}
    		};
    		Type.list.map = function(l, c, _){ return obj_map(l, c, _) };
    		Type.list.index = 1; // change this to 0 if you want non-logical, non-mathematical, non-matrix, non-convenient array notation
    		Type.obj = {is: function(o){ return o? (o instanceof Object && o.constructor === Object) || Object.prototype.toString.call(o).match(/^\[object (\w+)\]$/)[1] === 'Object' : false }};
    		Type.obj.put = function(o, k, v){ return (o||{})[k] = v, o };
    		Type.obj.has = function(o, k){ return o && Object.prototype.hasOwnProperty.call(o, k) };
    		Type.obj.del = function(o, k){
    			if(!o){ return }
    			o[k] = null;
    			delete o[k];
    			return o;
    		};
    		Type.obj.as = function(o, k, v, u){ return o[k] = o[k] || (u === v? {} : v) };
    		Type.obj.ify = function(o){
    			if(obj_is(o)){ return o }
    			try{o = JSON.parse(o);
    			}catch(e){o={};}			return o;
    		}
    		;(function(){ var u;
    			function map(v,k){
    				if(obj_has(this,k) && u !== this[k]){ return }
    				this[k] = v;
    			}
    			Type.obj.to = function(from, to){
    				to = to || {};
    				obj_map(from, map, to);
    				return to;
    			};
    		}());
    		Type.obj.copy = function(o){ // because http://web.archive.org/web/20140328224025/http://jsperf.com/cloning-an-object/2
    			return !o? o : JSON.parse(JSON.stringify(o)); // is shockingly faster than anything else, and our data has to be a subset of JSON anyways!
    		}
    		;(function(){
    			function empty(v,i){ var n = this.n;
    				if(n && (i === n || (obj_is(n) && obj_has(n, i)))){ return }
    				if(i){ return true }
    			}
    			Type.obj.empty = function(o, n){
    				if(!o){ return true }
    				return obj_map(o,empty,{n:n})? false : true;
    			};
    		}());
    (function(){
    			function t(k,v){
    				if(2 === arguments.length){
    					t.r = t.r || {};
    					t.r[k] = v;
    					return;
    				} t.r = t.r || [];
    				t.r.push(k);
    			}			var keys = Object.keys;
    			Type.obj.map = function(l, c, _){
    				var u, i = 0, x, r, ll, lle, f = fn_is(c);
    				t.r = null;
    				if(keys && obj_is(l)){
    					ll = keys(l); lle = true;
    				}
    				if(list_is(l) || ll){
    					x = (ll || l).length;
    					for(;i < x; i++){
    						var ii = (i + Type.list.index);
    						if(f){
    							r = lle? c.call(_ || this, l[ll[i]], ll[i], t) : c.call(_ || this, l[i], ii, t);
    							if(r !== u){ return r }
    						} else {
    							//if(Type.test.is(c,l[i])){ return ii } // should implement deep equality testing!
    							if(c === l[lle? ll[i] : i]){ return ll? ll[i] : ii } // use this for now
    						}
    					}
    				} else {
    					for(i in l){
    						if(f){
    							if(obj_has(l,i)){
    								r = _? c.call(_, l[i], i, t) : c(l[i], i, t);
    								if(r !== u){ return r }
    							}
    						} else {
    							//if(a.test.is(c,l[i])){ return i } // should implement deep equality testing!
    							if(c === l[i]){ return i } // use this for now
    						}
    					}
    				}
    				return f? t.r : Type.list.index? 0 : -1;
    			};
    		}());
    		Type.time = {};
    		Type.time.is = function(t){ return t? t instanceof Date : (+new Date().getTime()) };

    		var fn_is = Type.fn.is;
    		var list_is = Type.list.is;
    		var obj = Type.obj, obj_is = obj.is, obj_has = obj.has, obj_map = obj.map;
    		module.exports = Type;
    	})(USE, './type');
    USE(function(module){
    		// On event emitter generic javascript utility.
    		module.exports = function onto(tag, arg, as){
    			if(!tag){ return {to: onto} }
    			var u, tag = (this.tag || (this.tag = {}))[tag] ||
    			(this.tag[tag] = {tag: tag, to: onto._ = {
    				next: function(arg){ var tmp;
    					if((tmp = this.to)){
    						tmp.next(arg);
    				}}
    			}});
    			if(arg instanceof Function){
    				var be = {
    					off: onto.off ||
    					(onto.off = function(){
    						if(this.next === onto._.next){ return !0 }
    						if(this === this.the.last){
    							this.the.last = this.back;
    						}
    						this.to.back = this.back;
    						this.next = onto._.next;
    						this.back.to = this.to;
    						if(this.the.last === this.the){
    							delete this.on.tag[this.the.tag];
    						}
    					}),
    					to: onto._,
    					next: arg,
    					the: tag,
    					on: this,
    					as: as,
    				};
    				(be.back = tag.last || tag).to = be;
    				return tag.last = be;
    			}
    			if((tag = tag.to) && u !== arg){ tag.next(arg); }
    			return tag;
    		};
    	})(USE, './onto');
    USE(function(module){
    		/* Based on the Hypothetical Amnesia Machine thought experiment */
    		function HAM(machineState, incomingState, currentState, incomingValue, currentValue){
    			if(machineState < incomingState){
    				return {defer: true}; // the incoming value is outside the boundary of the machine's state, it must be reprocessed in another state.
    			}
    			if(incomingState < currentState){
    				return {historical: true}; // the incoming value is within the boundary of the machine's state, but not within the range.

    			}
    			if(currentState < incomingState){
    				return {converge: true, incoming: true}; // the incoming value is within both the boundary and the range of the machine's state.

    			}
    			if(incomingState === currentState){
    				incomingValue = Lexical(incomingValue) || "";
    				currentValue = Lexical(currentValue) || "";
    				if(incomingValue === currentValue){ // Note: while these are practically the same, the deltas could be technically different
    					return {state: true};
    				}
    				/*
    					The following is a naive implementation, but will always work.
    					Never change it unless you have specific needs that absolutely require it.
    					If changed, your data will diverge unless you guarantee every peer's algorithm has also been changed to be the same.
    					As a result, it is highly discouraged to modify despite the fact that it is naive,
    					because convergence (data integrity) is generally more important.
    					Any difference in this algorithm must be given a new and different name.
    				*/
    				if(incomingValue < currentValue){ // Lexical only works on simple value types!
    					return {converge: true, current: true};
    				}
    				if(currentValue < incomingValue){ // Lexical only works on simple value types!
    					return {converge: true, incoming: true};
    				}
    			}
    			return {err: "Invalid CRDT Data: "+ incomingValue +" to "+ currentValue +" at "+ incomingState +" to "+ currentState +"!"};
    		}
    		if(typeof JSON === 'undefined'){
    			throw new Error(
    				'JSON is not included in this browser. Please load it first: ' +
    				'ajax.cdnjs.com/ajax/libs/json2/20110223/json2.js'
    			);
    		}
    		var Lexical = JSON.stringify;
    		module.exports = HAM;
    	})(USE, './HAM');
    USE(function(module){
    		var Type = USE('./type');
    		var Val = {};
    		Val.is = function(v){ // Valid values are a subset of JSON: null, binary, number (!Infinity), text, or a soul relation. Arrays need special algorithms to handle concurrency, so they are not supported directly. Use an extension that supports them if needed but research their problems first.
    			if(v === u){ return false }
    			if(v === null){ return true } // "deletes", nulling out keys.
    			if(v === Infinity){ return false } // we want this to be, but JSON does not support it, sad face.
    			if(text_is(v) // by "text" we mean strings.
    			|| bi_is(v) // by "binary" we mean boolean.
    			|| num_is(v)){ // by "number" we mean integers or decimals.
    				return true; // simple values are valid.
    			}
    			return Val.link.is(v) || false; // is the value a soul relation? Then it is valid and return it. If not, everything else remaining is an invalid data type. Custom extensions can be built on top of these primitives to support other types.
    		};
    		Val.link = Val.rel = {_: '#'};
    (function(){
    			Val.link.is = function(v){ // this defines whether an object is a soul relation or not, they look like this: {'#': 'UUID'}
    				if(v && v[rel_] && !v._ && obj_is(v)){ // must be an object.
    					var o = {};
    					obj_map(v, map, o);
    					if(o.id){ // a valid id was found.
    						return o.id; // yay! Return it.
    					}
    				}
    				return false; // the value was not a valid soul relation.
    			};
    			function map(s, k){ var o = this; // map over the object...
    				if(o.id){ return o.id = false } // if ID is already defined AND we're still looping through the object, it is considered invalid.
    				if(k == rel_ && text_is(s)){ // the key should be '#' and have a text value.
    					o.id = s; // we found the soul!
    				} else {
    					return o.id = false; // if there exists anything else on the object that isn't the soul, then it is considered invalid.
    				}
    			}
    		}());
    		Val.link.ify = function(t){ return obj_put({}, rel_, t) }; // convert a soul into a relation and return it.
    		Type.obj.has._ = '.';
    		var rel_ = Val.link._, u;
    		var bi_is = Type.bi.is;
    		var num_is = Type.num.is;
    		var text_is = Type.text.is;
    		var obj = Type.obj, obj_is = obj.is, obj_put = obj.put, obj_map = obj.map;
    		module.exports = Val;
    	})(USE, './val');
    USE(function(module){
    		var Type = USE('./type');
    		var Val = USE('./val');
    		var Node = {_: '_'};
    		Node.soul = function(n, o){ return (n && n._ && n._[o || soul_]) }; // convenience function to check to see if there is a soul on a node and return it.
    		Node.soul.ify = function(n, o){ // put a soul on an object.
    			o = (typeof o === 'string')? {soul: o} : o || {};
    			n = n || {}; // make sure it exists.
    			n._ = n._ || {}; // make sure meta exists.
    			n._[soul_] = o.soul || n._[soul_] || text_random(); // put the soul on it.
    			return n;
    		};
    		Node.soul._ = Val.link._;
    (function(){
    			Node.is = function(n, cb, as){ var s; // checks to see if an object is a valid node.
    				if(!obj_is(n)){ return false } // must be an object.
    				if(s = Node.soul(n)){ // must have a soul on it.
    					return !obj_map(n, map, {as:as,cb:cb,s:s,n:n});
    				}
    				return false; // nope! This was not a valid node.
    			};
    			function map(v, k){ // we invert this because the way we check for this is via a negation.
    				if(k === Node._){ return } // skip over the metadata.
    				if(!Val.is(v)){ return true } // it is true that this is an invalid node.
    				if(this.cb){ this.cb.call(this.as, v, k, this.n, this.s); } // optionally callback each key/value.
    			}
    		}());
    (function(){
    			Node.ify = function(obj, o, as){ // returns a node from a shallow object.
    				if(!o){ o = {}; }
    				else if(typeof o === 'string'){ o = {soul: o}; }
    				else if(o instanceof Function){ o = {map: o}; }
    				if(o.map){ o.node = o.map.call(as, obj, u, o.node || {}); }
    				if(o.node = Node.soul.ify(o.node || {}, o)){
    					obj_map(obj, map, {o:o,as:as});
    				}
    				return o.node; // This will only be a valid node if the object wasn't already deep!
    			};
    			function map(v, k){ var o = this.o, tmp, u; // iterate over each key/value.
    				if(o.map){
    					tmp = o.map.call(this.as, v, ''+k, o.node);
    					if(u === tmp){
    						obj_del(o.node, k);
    					} else
    					if(o.node){ o.node[k] = tmp; }
    					return;
    				}
    				if(Val.is(v)){
    					o.node[k] = v;
    				}
    			}
    		}());
    		var obj = Type.obj, obj_is = obj.is, obj_del = obj.del, obj_map = obj.map;
    		var text = Type.text, text_random = text.random;
    		var soul_ = Node.soul._;
    		var u;
    		module.exports = Node;
    	})(USE, './node');
    USE(function(module){
    		var Type = USE('./type');
    		var Node = USE('./node');
    		function State(){
    			var t;
    			/*if(perf){
    				t = start + perf.now(); // Danger: Accuracy decays significantly over time, even if precise.
    			} else {*/
    				t = time();
    			//}
    			if(last < t){
    				return N = 0, last = t + State.drift;
    			}
    			return last = t + ((N += 1) / D) + State.drift;
    		}
    		var time = Type.time.is, last = -Infinity, N = 0, D = 1000; // WARNING! In the future, on machines that are D times faster than 2016AD machines, you will want to increase D by another several orders of magnitude so the processing speed never out paces the decimal resolution (increasing an integer effects the state accuracy).
    		var perf = (typeof performance !== 'undefined')? (performance.timing && performance) : false, start = (perf && perf.timing && perf.timing.navigationStart) || (perf = false);
    		State._ = '>';
    		State.drift = 0;
    		State.is = function(n, k, o){ // convenience function to get the state on a key on a node and return it.
    			var tmp = (k && n && n[N_] && n[N_][State._]) || o;
    			if(!tmp){ return }
    			return num_is(tmp = tmp[k])? tmp : -Infinity;
    		};
    		State.lex = function(){ return State().toString(36).replace('.','') };
    		State.ify = function(n, k, s, v, soul){ // put a key's state on a node.
    			if(!n || !n[N_]){ // reject if it is not node-like.
    				if(!soul){ // unless they passed a soul
    					return;
    				}
    				n = Node.soul.ify(n, soul); // then make it so!
    			}
    			var tmp = obj_as(n[N_], State._); // grab the states data.
    			if(u !== k && k !== N_){
    				if(num_is(s)){
    					tmp[k] = s; // add the valid state.
    				}
    				if(u !== v){ // Note: Not its job to check for valid values!
    					n[k] = v;
    				}
    			}
    			return n;
    		};
    		State.to = function(from, k, to){
    			var val = (from||{})[k];
    			if(obj_is(val)){
    				val = obj_copy(val);
    			}
    			return State.ify(to, k, State.is(from, k), val, Node.soul(from));
    		}
    		;(function(){
    			State.map = function(cb, s, as){ var u; // for use with Node.ify
    				var o = obj_is(o = cb || s)? o : null;
    				cb = fn_is(cb = cb || s)? cb : null;
    				if(o && !cb){
    					s = num_is(s)? s : State();
    					o[N_] = o[N_] || {};
    					obj_map(o, map, {o:o,s:s});
    					return o;
    				}
    				as = as || obj_is(s)? s : u;
    				s = num_is(s)? s : State();
    				return function(v, k, o, opt){
    					if(!cb){
    						map.call({o: o, s: s}, v,k);
    						return v;
    					}
    					cb.call(as || this || {}, v, k, o, opt);
    					if(obj_has(o,k) && u === o[k]){ return }
    					map.call({o: o, s: s}, v,k);
    				}
    			};
    			function map(v,k){
    				if(N_ === k){ return }
    				State.ify(this.o, k, this.s) ;
    			}
    		}());
    		var obj = Type.obj, obj_as = obj.as, obj_has = obj.has, obj_is = obj.is, obj_map = obj.map, obj_copy = obj.copy;
    		var num = Type.num, num_is = num.is;
    		var fn = Type.fn, fn_is = fn.is;
    		var N_ = Node._, u;
    		module.exports = State;
    	})(USE, './state');
    USE(function(module){
    		var Type = USE('./type');
    		var Val = USE('./val');
    		var Node = USE('./node');
    		var Graph = {};
    (function(){
    			Graph.is = function(g, cb, fn, as){ // checks to see if an object is a valid graph.
    				if(!g || !obj_is(g) || obj_empty(g)){ return false } // must be an object.
    				return !obj_map(g, map, {cb:cb,fn:fn,as:as}); // makes sure it wasn't an empty object.
    			};
    			function map(n, s){ // we invert this because the way'? we check for this is via a negation.
    				if(!n || s !== Node.soul(n) || !Node.is(n, this.fn, this.as)){ return true } // it is true that this is an invalid graph.
    				if(!this.cb){ return }
    				nf.n = n; nf.as = this.as; // sequential race conditions aren't races.
    				this.cb.call(nf.as, n, s, nf);
    			}
    			function nf(fn){ // optional callback for each node.
    				if(fn){ Node.is(nf.n, fn, nf.as); } // where we then have an optional callback for each key/value.
    			}
    		}());
    (function(){
    			Graph.ify = function(obj, env, as){
    				var at = {path: [], obj: obj};
    				if(!env){
    					env = {};
    				} else
    				if(typeof env === 'string'){
    					env = {soul: env};
    				} else
    				if(env instanceof Function){
    					env.map = env;
    				}
    				if(env.soul){
    					at.link = Val.link.ify(env.soul);
    				}
    				env.shell = (as||{}).shell;
    				env.graph = env.graph || {};
    				env.seen = env.seen || [];
    				env.as = env.as || as;
    				node(env, at);
    				env.root = at.node;
    				return env.graph;
    			};
    			function node(env, at){ var tmp;
    				if(tmp = seen(env, at)){ return tmp }
    				at.env = env;
    				at.soul = soul;
    				if(Node.ify(at.obj, map, at)){
    					at.link = at.link || Val.link.ify(Node.soul(at.node));
    					if(at.obj !== env.shell){
    						env.graph[Val.link.is(at.link)] = at.node;
    					}
    				}
    				return at;
    			}
    			function map(v,k,n){
    				var at = this, env = at.env, is, tmp;
    				if(Node._ === k && obj_has(v,Val.link._)){
    					return n._; // TODO: Bug?
    				}
    				if(!(is = valid(v,k,n, at,env))){ return }
    				if(!k){
    					at.node = at.node || n || {};
    					if(obj_has(v, Node._) && Node.soul(v)){ // ? for safety ?
    						at.node._ = obj_copy(v._);
    					}
    					at.node = Node.soul.ify(at.node, Val.link.is(at.link));
    					at.link = at.link || Val.link.ify(Node.soul(at.node));
    				}
    				if(tmp = env.map){
    					tmp.call(env.as || {}, v,k,n, at);
    					if(obj_has(n,k)){
    						v = n[k];
    						if(u === v){
    							obj_del(n, k);
    							return;
    						}
    						if(!(is = valid(v,k,n, at,env))){ return }
    					}
    				}
    				if(!k){ return at.node }
    				if(true === is){
    					return v;
    				}
    				tmp = node(env, {obj: v, path: at.path.concat(k)});
    				if(!tmp.node){ return }
    				return tmp.link; //{'#': Node.soul(tmp.node)};
    			}
    			function soul(id){ var at = this;
    				var prev = Val.link.is(at.link), graph = at.env.graph;
    				at.link = at.link || Val.link.ify(id);
    				at.link[Val.link._] = id;
    				if(at.node && at.node[Node._]){
    					at.node[Node._][Val.link._] = id;
    				}
    				if(obj_has(graph, prev)){
    					graph[id] = graph[prev];
    					obj_del(graph, prev);
    				}
    			}
    			function valid(v,k,n, at,env){ var tmp;
    				if(Val.is(v)){ return true }
    				if(obj_is(v)){ return 1 }
    				if(tmp = env.invalid){
    					v = tmp.call(env.as || {}, v,k,n);
    					return valid(v,k,n, at,env);
    				}
    				env.err = "Invalid value at '" + at.path.concat(k).join('.') + "'!";
    				if(Type.list.is(v)){ env.err += " Use `.set(item)` instead of an Array."; }
    			}
    			function seen(env, at){
    				var arr = env.seen, i = arr.length, has;
    				while(i--){ has = arr[i];
    					if(at.obj === has.obj){ return has }
    				}
    				arr.push(at);
    			}
    		}());
    		Graph.node = function(node){
    			var soul = Node.soul(node);
    			if(!soul){ return }
    			return obj_put({}, soul, node);
    		}
    		;(function(){
    			Graph.to = function(graph, root, opt){
    				if(!graph){ return }
    				var obj = {};
    				opt = opt || {seen: {}};
    				obj_map(graph[root], map, {obj:obj, graph: graph, opt: opt});
    				return obj;
    			};
    			function map(v,k){ var tmp, obj;
    				if(Node._ === k){
    					if(obj_empty(v, Val.link._)){
    						return;
    					}
    					this.obj[k] = obj_copy(v);
    					return;
    				}
    				if(!(tmp = Val.link.is(v))){
    					this.obj[k] = v;
    					return;
    				}
    				if(obj = this.opt.seen[tmp]){
    					this.obj[k] = obj;
    					return;
    				}
    				this.obj[k] = this.opt.seen[tmp] = Graph.to(this.graph, tmp, this.opt);
    			}
    		}());
    		var fn_is = Type.fn.is;
    		var obj = Type.obj, obj_is = obj.is, obj_del = obj.del, obj_has = obj.has, obj_empty = obj.empty, obj_put = obj.put, obj_map = obj.map, obj_copy = obj.copy;
    		var u;
    		module.exports = Graph;
    	})(USE, './graph');
    USE(function(module){
    		// request / response module, for asking and acking messages.
    		USE('./onto'); // depends upon onto!
    		module.exports = function ask(cb, as){
    			if(!this.on){ return }
    			if(!(cb instanceof Function)){
    				if(!cb || !as){ return }
    				var id = cb['#'] || cb, tmp = (this.tag||empty)[id];
    				if(!tmp){ return }
    				tmp = this.on(id, as);
    				clearTimeout(tmp.err);
    				return true;
    			}
    			var id = (as && as['#']) || Math.random().toString(36).slice(2);
    			if(!cb){ return id }
    			var to = this.on(id, cb, as);
    			to.err = to.err || setTimeout(function(){
    				to.next({err: "Error: No ACK received yet.", lack: true});
    				to.off();
    			}, (this.opt||{}).lack || 9000);
    			return id;
    		};
    	})(USE, './ask');
    USE(function(module){
    		var Type = USE('./type');
    		function Dup(opt){
    			var dup = {s:{}};
    			opt = opt || {max: 1000, age: 1000 * 9};//1000 * 60 * 2};
    			dup.check = function(id){ var tmp;
    				if(!(tmp = dup.s[id])){ return false }
    				if(tmp.pass){ return tmp.pass = false }
    				return dup.track(id);
    			};
    			dup.track = function(id, pass){
    				var it = dup.s[id] || (dup.s[id] = {});
    				it.was = time_is();
    				if(pass){ it.pass = true; }
    				if(!dup.to){
    					dup.to = setTimeout(function(){
    						var now = time_is();
    						Type.obj.map(dup.s, function(it, id){
    							if(it && opt.age > (now - it.was)){ return }
    							Type.obj.del(dup.s, id);
    						});
    						dup.to = null;
    					}, opt.age + 9);
    				}
    				return it;
    			};
    			return dup;
    		}
    		var time_is = Type.time.is;
    		module.exports = Dup;
    	})(USE, './dup');
    USE(function(module){

    		function Gun(o){
    			if(o instanceof Gun){ return (this._ = {gun: this, $: this}).$ }
    			if(!(this instanceof Gun)){ return new Gun(o) }
    			return Gun.create(this._ = {gun: this, $: this, opt: o});
    		}

    		Gun.is = function($){ return ($ instanceof Gun) || ($ && $._ && ($ === $._.$)) || false };

    		Gun.version = 0.9;

    		Gun.chain = Gun.prototype;
    		Gun.chain.toJSON = function(){};

    		var Type = USE('./type');
    		Type.obj.to(Type, Gun);
    		Gun.HAM = USE('./HAM');
    		Gun.val = USE('./val');
    		Gun.node = USE('./node');
    		Gun.state = USE('./state');
    		Gun.graph = USE('./graph');
    		Gun.on = USE('./onto');
    		Gun.ask = USE('./ask');
    		Gun.dup = USE('./dup');
    (function(){
    			Gun.create = function(at){
    				at.root = at.root || at;
    				at.graph = at.graph || {};
    				at.on = at.on || Gun.on;
    				at.ask = at.ask || Gun.ask;
    				at.dup = at.dup || Gun.dup();
    				var gun = at.$.opt(at.opt);
    				if(!at.once){
    					at.on('in', root, at);
    					at.on('out', root, {at: at, out: root});
    					Gun.on('create', at);
    					at.on('create', at);
    				}
    				at.once = 1;
    				return gun;
    			};
    			function root(msg){
    				//add to.next(at); // TODO: MISSING FEATURE!!!
    				var ev = this, as = ev.as, at = as.at || as, gun = at.$, dup, tmp;
    				if(!(tmp = msg['#'])){ tmp = msg['#'] = text_rand(9); }
    				if((dup = at.dup).check(tmp)){
    					if(as.out === msg.out){
    						msg.out = u;
    						ev.to.next(msg);
    					}
    					return;
    				}
    				dup.track(tmp);
    				if(!at.ask(msg['@'], msg)){
    					if(msg.get){
    						Gun.on.get(msg, gun); //at.on('get', get(msg));
    					}
    					if(msg.put){
    						Gun.on.put(msg, gun); //at.on('put', put(msg));
    					}
    				}
    				ev.to.next(msg);
    				if(!as.out){
    					msg.out = root;
    					at.on('out', msg);
    				}
    			}
    		}());
    (function(){
    			Gun.on.put = function(msg, gun){
    				var at = gun._, ctx = {$: gun, graph: at.graph, put: {}, map: {}, souls: {}, machine: Gun.state(), ack: msg['@'], cat: at, stop: {}};
    				if(!Gun.graph.is(msg.put, null, verify, ctx)){ ctx.err = "Error: Invalid graph!"; }
    				if(ctx.err){ return at.on('in', {'@': msg['#'], err: Gun.log(ctx.err) }) }
    				obj_map(ctx.put, merge, ctx);
    				if(!ctx.async){ obj_map(ctx.map, map, ctx); }
    				if(u !== ctx.defer){
    					setTimeout(function(){
    						Gun.on.put(msg, gun);
    					}, ctx.defer - ctx.machine);
    				}
    				if(!ctx.diff){ return }
    				at.on('put', obj_to(msg, {put: ctx.diff}));
    			};
    			function verify(val, key, node, soul){ var ctx = this;
    				var state = Gun.state.is(node, key);
    				if(!state){ return ctx.err = "Error: No state on '"+key+"' in node '"+soul+"'!" }
    				var vertex = ctx.graph[soul] || empty, was = Gun.state.is(vertex, key, true), known = vertex[key];
    				var HAM = Gun.HAM(ctx.machine, state, was, val, known);
    				if(!HAM.incoming){
    					if(HAM.defer){ // pick the lowest
    						ctx.defer = (state < (ctx.defer || Infinity))? state : ctx.defer;
    					}
    					return;
    				}
    				ctx.put[soul] = Gun.state.to(node, key, ctx.put[soul]);
    				(ctx.diff || (ctx.diff = {}))[soul] = Gun.state.to(node, key, ctx.diff[soul]);
    				ctx.souls[soul] = true;
    			}
    			function merge(node, soul){
    				var ctx = this, cat = ctx.$._, at = (cat.next || empty)[soul];
    				if(!at){
    					if(!(cat.opt||empty).super){
    						ctx.souls[soul] = false;
    						return;
    					}
    					at = (ctx.$.get(soul)._);
    				}
    				var msg = ctx.map[soul] = {
    					put: node,
    					get: soul,
    					$: at.$
    				}, as = {ctx: ctx, msg: msg};
    				ctx.async = !!cat.tag.node;
    				if(ctx.ack){ msg['@'] = ctx.ack; }
    				obj_map(node, each, as);
    				if(!ctx.async){ return }
    				if(!ctx.and){
    					// If it is async, we only need to setup one listener per context (ctx)
    					cat.on('node', function(m){
    						this.to.next(m); // make sure to call other context's listeners.
    						if(m !== ctx.map[m.get]){ return } // filter out events not from this context!
    						ctx.souls[m.get] = false; // set our many-async flag
    						obj_map(m.put, patch, m); // merge into view
    						if(obj_map(ctx.souls, function(v){ if(v){ return v } })){ return } // if flag still outstanding, keep waiting.
    						if(ctx.c){ return } ctx.c = 1; // failsafe for only being called once per context.
    						this.off();
    						obj_map(ctx.map, map, ctx); // all done, trigger chains.
    					});
    				}
    				ctx.and = true;
    				cat.on('node', msg); // each node on the current context's graph needs to be emitted though.
    			}
    			function each(val, key){
    				var ctx = this.ctx, graph = ctx.graph, msg = this.msg, soul = msg.get, node = msg.put, at = (msg.$._);
    				graph[soul] = Gun.state.to(node, key, graph[soul]);
    				if(ctx.async){ return }
    				at.put = Gun.state.to(node, key, at.put);
    			}
    			function patch(val, key){
    				var msg = this, node = msg.put, at = (msg.$._);
    				at.put = Gun.state.to(node, key, at.put);
    			}
    			function map(msg, soul){
    				if(!msg.$){ return }
    				this.cat.stop = this.stop; // temporary fix till a better solution?
    				(msg.$._).on('in', msg);
    				this.cat.stop = null; // temporary fix till a better solution?
    			}

    			Gun.on.get = function(msg, gun){
    				var root = gun._, get = msg.get, soul = get[_soul], node = root.graph[soul], has = get[_has], tmp;
    				var next = root.next || (root.next = {}), at = next[soul];
    				if(!node){ return root.on('get', msg) }
    				if(has){
    					if('string' != typeof has || !obj_has(node, has)){ return root.on('get', msg) }
    					node = Gun.state.to(node, has);
    					// If we have a key in-memory, do we really need to fetch?
    					// Maybe... in case the in-memory key we have is a local write
    					// we still need to trigger a pull/merge from peers.
    				} else {
    					node = Gun.obj.copy(node);
    				}
    				node = Gun.graph.node(node);
    				tmp = (at||empty).ack;
    				root.on('in', {
    					'@': msg['#'],
    					how: 'mem',
    					put: node,
    					$: gun
    				});
    				//if(0 < tmp){ return }
    				root.on('get', msg);
    			};
    		}());
    (function(){
    			Gun.chain.opt = function(opt){
    				opt = opt || {};
    				var gun = this, at = gun._, tmp = opt.peers || opt;
    				if(!obj_is(opt)){ opt = {}; }
    				if(!obj_is(at.opt)){ at.opt = opt; }
    				if(text_is(tmp)){ tmp = [tmp]; }
    				if(list_is(tmp)){
    					tmp = obj_map(tmp, function(url, i, map){
    						map(url, {url: url});
    					});
    					if(!obj_is(at.opt.peers)){ at.opt.peers = {};}
    					at.opt.peers = obj_to(tmp, at.opt.peers);
    				}
    				at.opt.peers = at.opt.peers || {};
    				obj_to(opt, at.opt); // copies options on to `at.opt` only if not already taken.
    				Gun.on('opt', at);
    				at.opt.uuid = at.opt.uuid || function(){ return state_lex() + text_rand(12) };
    				return gun;
    			};
    		}());

    		var list_is = Gun.list.is;
    		var text = Gun.text, text_is = text.is, text_rand = text.random;
    		var obj = Gun.obj, obj_is = obj.is, obj_has = obj.has, obj_to = obj.to, obj_map = obj.map, obj_copy = obj.copy;
    		var state_lex = Gun.state.lex, _soul = Gun.val.link._, _has = '.', node_ = Gun.node._, rel_is = Gun.val.link.is;
    		var empty = {}, u;

    		console.debug = function(i, s){ return (console.debug.i && i === console.debug.i && console.debug.i++) && (console.log.apply(console, arguments) || s) };

    		Gun.log = function(){ return (!Gun.log.off && console.log.apply(console, arguments)), [].slice.call(arguments).join(' ') };
    		Gun.log.once = function(w,s,o){ return (o = Gun.log.once)[w] = o[w] || 0, o[w]++ || Gun.log(s) }

    		;		Gun.log.once("welcome", "Hello wonderful person! :) Thanks for using GUN, feel free to ask for help on https://gitter.im/amark/gun and ask StackOverflow questions tagged with 'gun'!");

    		if(typeof window !== "undefined"){ (window.GUN = window.Gun = Gun).window = window; }
    		try{ if(typeof common !== "undefined"){ common.exports = Gun; } }catch(e){}
    		module.exports = Gun;

    		/*Gun.on('opt', function(ctx){ // FOR TESTING PURPOSES
    			this.to.next(ctx);
    			if(ctx.once){ return }
    			ctx.on('node', function(msg){
    				var to = this.to;
    				//Gun.node.is(msg.put, function(v,k){ msg.put[k] = v + v });
    				setTimeout(function(){
    					to.next(msg);
    				},1);
    			});
    		});*/
    	})(USE, './root');
    USE(function(module){
    		var Gun = USE('./root');
    		Gun.chain.back = function(n, opt){ var tmp;
    			n = n || 1;
    			if(-1 === n || Infinity === n){
    				return this._.root.$;
    			} else
    			if(1 === n){
    				return (this._.back || this._).$;
    			}
    			var gun = this, at = gun._;
    			if(typeof n === 'string'){
    				n = n.split('.');
    			}
    			if(n instanceof Array){
    				var i = 0, l = n.length, tmp = at;
    				for(i; i < l; i++){
    					tmp = (tmp||empty)[n[i]];
    				}
    				if(u !== tmp){
    					return opt? gun : tmp;
    				} else
    				if((tmp = at.back)){
    					return tmp.$.back(n, opt);
    				}
    				return;
    			}
    			if(n instanceof Function){
    				var yes, tmp = {back: at};
    				while((tmp = tmp.back)
    				&& u === (yes = n(tmp, opt))){}
    				return yes;
    			}
    			if(Gun.num.is(n)){
    				return (at.back || at).$.back(n - 1);
    			}
    			return this;
    		};
    		var empty = {}, u;
    	})(USE, './back');
    USE(function(module){
    		// WARNING: GUN is very simple, but the JavaScript chaining API around GUN
    		// is complicated and was extremely hard to build. If you port GUN to another
    		// language, consider implementing an easier API to build.
    		var Gun = USE('./root');
    		Gun.chain.chain = function(sub){
    			var gun = this, at = gun._, chain = new (sub || gun).constructor(gun), cat = chain._, root;
    			cat.root = root = at.root;
    			cat.id = ++root.once;
    			cat.back = gun._;
    			cat.on = Gun.on;
    			cat.on('in', input, cat); // For 'in' if I add my own listeners to each then I MUST do it before in gets called. If I listen globally for all incoming data instead though, regardless of individual listeners, I can transform the data there and then as well.
    			cat.on('out', output, cat); // However for output, there isn't really the global option. I must listen by adding my own listener individually BEFORE this one is ever called.
    			return chain;
    		};

    		function output(msg){
    			var put, get, at = this.as, back = at.back, root = at.root, tmp;
    			if(!msg.$){ msg.$ = at.$; }
    			this.to.next(msg);
    			if(get = msg.get){
    				/*if(u !== at.put){
    					at.on('in', at);
    					return;
    				}*/
    				if(at.lex){ msg.get = obj_to(at.lex, msg.get); }
    				if(get['#'] || at.soul){
    					get['#'] = get['#'] || at.soul;
    					msg['#'] || (msg['#'] = text_rand(9));
    					back = (root.$.get(get['#'])._);
    					if(!(get = get['.'])){
    						tmp = back.ack;
    						if(!tmp){ back.ack = -1; }
    						if(obj_has(back, 'put')){
    							back.on('in', back);
    						}
    						if(tmp){ return }
    						msg.$ = back.$;
    					} else
    					if(obj_has(back.put, get)){
    						put = (back.$.get(get)._);
    						if(!(tmp = put.ack)){ put.ack = -1; }
    						back.on('in', {
    							$: back.$,
    							put: Gun.state.to(back.put, get),
    							get: back.get
    						});
    						if(tmp){ return }
    					} else
    					if('string' != typeof get){
    						var put = {}, meta = (back.put||{})._;
    						Gun.obj.map(back.put, function(v,k){
    							if(!Gun.text.match(k, get)){ return }
    							put[k] = v;
    						});
    						if(!Gun.obj.empty(put)){
    							put._ = meta;
    							back.on('in', {$: back.$, put: put, get: back.get});
    						}
    					}
    					root.ask(ack, msg);
    					return root.on('in', msg);
    				}
    				if(root.now){ root.now[at.id] = root.now[at.id] || true; at.pass = {}; }
    				if(get['.']){
    					if(at.get){
    						msg = {get: {'.': at.get}, $: at.$};
    						//if(back.ask || (back.ask = {})[at.get]){ return }
    						(back.ask || (back.ask = {}));
    						back.ask[at.get] = msg.$._; // TODO: PERFORMANCE? More elegant way?
    						return back.on('out', msg);
    					}
    					msg = {get: {}, $: at.$};
    					return back.on('out', msg);
    				}
    				at.ack = at.ack || -1;
    				if(at.get){
    					msg.$ = at.$;
    					get['.'] = at.get;
    					(back.ask || (back.ask = {}))[at.get] = msg.$._; // TODO: PERFORMANCE? More elegant way?
    					return back.on('out', msg);
    				}
    			}
    			return back.on('out', msg);
    		}

    		function input(msg){
    			var eve = this, cat = eve.as, root = cat.root, gun = msg.$, at = (gun||empty)._ || empty, change = msg.put, rel, tmp;
    			if(cat.get && msg.get !== cat.get){
    				msg = obj_to(msg, {get: cat.get});
    			}
    			if(cat.has && at !== cat){
    				msg = obj_to(msg, {$: cat.$});
    				if(at.ack){
    					cat.ack = at.ack;
    					//cat.ack = cat.ack || at.ack;
    				}
    			}
    			if(u === change){
    				tmp = at.put;
    				eve.to.next(msg);
    				if(cat.soul){ return } // TODO: BUG, I believee the fresh input refactor caught an edge case that a `gun.get('soul').get('key')` that points to a soul that doesn't exist will not trigger val/get etc.
    				if(u === tmp && u !== at.put){ return }
    				echo(cat, msg);
    				if(cat.has){
    					not(cat, msg);
    				}
    				obj_del(at.echo, cat.id);
    				obj_del(cat.map, at.id);
    				return;
    			}
    			if(cat.soul){
    				eve.to.next(msg);
    				echo(cat, msg);
    				if(cat.next){ obj_map(change, map, {msg: msg, cat: cat}); }
    				return;
    			}
    			if(!(rel = Gun.val.link.is(change))){
    				if(Gun.val.is(change)){
    					if(cat.has || cat.soul){
    						not(cat, msg);
    					} else
    					if(at.has || at.soul){
    						(at.echo || (at.echo = {}))[cat.id] = at.echo[at.id] || cat;
    						(cat.map || (cat.map = {}))[at.id] = cat.map[at.id] || {at: at};
    						//if(u === at.put){ return } // Not necessary but improves performance. If we have it but at does not, that means we got things out of order and at will get it. Once at gets it, it will tell us again.
    					}
    					eve.to.next(msg);
    					echo(cat, msg);
    					return;
    				}
    				if(cat.has && at !== cat && obj_has(at, 'put')){
    					cat.put = at.put;
    				}				if((rel = Gun.node.soul(change)) && at.has){
    					at.put = (cat.root.$.get(rel)._).put;
    				}
    				tmp = (root.stop || {})[at.id];
    				//if(tmp && tmp[cat.id]){ } else {
    					eve.to.next(msg);
    				//}
    				relate(cat, msg, at, rel);
    				echo(cat, msg);
    				if(cat.next){ obj_map(change, map, {msg: msg, cat: cat}); }
    				return;
    			}
    			var was = root.stop;
    			tmp = root.stop || {};
    			tmp = tmp[at.id] || (tmp[at.id] = {});
    			//if(tmp[cat.id]){ return }
    			tmp.is = tmp.is || at.put;
    			tmp[cat.id] = at.put || true;
    			//if(root.stop){
    				eve.to.next(msg);
    			//}
    			relate(cat, msg, at, rel);
    			echo(cat, msg);
    		}

    		function relate(at, msg, from, rel){
    			if(!rel || node_ === at.get){ return }
    			var tmp = (at.root.$.get(rel)._);
    			if(at.has){
    				from = tmp;
    			} else
    			if(from.has){
    				relate(from, msg, from, rel);
    			}
    			if(from === at){ return }
    			if(!from.$){ from = {}; }
    			(from.echo || (from.echo = {}))[at.id] = from.echo[at.id] || at;
    			if(at.has && !(at.map||empty)[from.id]){ // if we haven't seen this before.
    				not(at, msg);
    			}
    			tmp = from.id? ((at.map || (at.map = {}))[from.id] = at.map[from.id] || {at: from}) : {};
    			if(rel === tmp.link){
    				if(!(tmp.pass || at.pass)){
    					return;
    				}
    			}
    			if(at.pass){
    				Gun.obj.map(at.map, function(tmp){ tmp.pass = true; });
    				obj_del(at, 'pass');
    			}
    			if(tmp.pass){ obj_del(tmp, 'pass'); }
    			if(at.has){ at.link = rel; }
    			ask(at, tmp.link = rel);
    		}
    		function echo(at, msg, ev){
    			if(!at.echo){ return } // || node_ === at.get ?
    			//if(at.has){ msg = obj_to(msg, {event: ev}) }
    			obj_map(at.echo, reverb, msg);
    		}
    		function reverb(to){
    			if(!to || !to.on){ return }
    			to.on('in', this);
    		}
    		function map(data, key){ // Map over only the changes on every update.
    			var cat = this.cat, next = cat.next || empty, via = this.msg, chain, at, tmp;
    			if(node_ === key && !next[key]){ return }
    			if(!(at = next[key])){
    				return;
    			}
    			//if(data && data[_soul] && (tmp = Gun.val.link.is(data)) && (tmp = (cat.root.$.get(tmp)._)) && obj_has(tmp, 'put')){
    			//	data = tmp.put;
    			//}
    			if(at.has){
    				//if(!(data && data[_soul] && Gun.val.link.is(data) === Gun.node.soul(at.put))){
    				if(u === at.put || !Gun.val.link.is(data)){
    					at.put = data;
    				}
    				chain = at.$;
    			} else
    			if(tmp = via.$){
    				tmp = (chain = via.$.get(key))._;
    				if(u === tmp.put || !Gun.val.link.is(data)){
    					tmp.put = data;
    				}
    			}
    			at.on('in', {
    				put: data,
    				get: key,
    				$: chain,
    				via: via
    			});
    		}
    		function not(at, msg){
    			if(!(at.has || at.soul)){ return }
    			var tmp = at.map, root = at.root;
    			at.map = null;
    			if(at.has){
    				if(at.dub && at.root.stop){ at.dub = null; }
    				at.link = null;
    			}
    			//if(!root.now || !root.now[at.id]){
    			if(!at.pass){
    				if((!msg['@']) && null === tmp){ return }
    				//obj_del(at, 'pass');
    			}
    			if(u === tmp && Gun.val.link.is(at.put)){ return } // This prevents the very first call of a thing from triggering a "clean up" call. // TODO: link.is(at.put) || !val.is(at.put) ?
    			obj_map(tmp, function(proxy){
    				if(!(proxy = proxy.at)){ return }
    				obj_del(proxy.echo, at.id);
    			});
    			tmp = at.put;
    			obj_map(at.next, function(neat, key){
    				if(u === tmp && u !== at.put){ return true }
    				neat.put = u;
    				if(neat.ack){
    					neat.ack = -1;
    				}
    				neat.on('in', {
    					get: key,
    					$: neat.$,
    					put: u
    				});
    			});
    		}
    		function ask(at, soul){
    			var tmp = (at.root.$.get(soul)._);
    			if(at.ack){
    				tmp.on('out', {get: {'#': soul}});
    				if(!at.ask){ return } // TODO: PERFORMANCE? More elegant way?
    			}
    			tmp = at.ask; Gun.obj.del(at, 'ask');
    			obj_map(tmp || at.next, function(neat, key){
    				neat.on('out', {get: {'#': soul, '.': key}});
    			});
    			Gun.obj.del(at, 'ask'); // TODO: PERFORMANCE? More elegant way?
    		}
    		function ack(msg, ev){
    			var as = this.as, get = as.get || empty, at = as.$._, tmp = (msg.put||empty)[get['#']];
    			if(at.ack){ at.ack = (at.ack + 1) || 1; }
    			if(!msg.put || ('string' == typeof get['.'] && !obj_has(tmp, at.get))){
    				if(at.put !== u){ return }
    				at.on('in', {
    					get: at.get,
    					put: at.put = u,
    					$: at.$,
    					'@': msg['@']
    				});
    				return;
    			}
    			if(node_ == get['.']){ // is this a security concern?
    				at.on('in', {get: at.get, put: Gun.val.link.ify(get['#']), $: at.$, '@': msg['@']});
    				return;
    			}
    			Gun.on.put(msg, at.root.$);
    		}
    		var empty = {}, u;
    		var obj = Gun.obj, obj_has = obj.has, obj_put = obj.put, obj_del = obj.del, obj_to = obj.to, obj_map = obj.map;
    		var text_rand = Gun.text.random;
    		var _soul = Gun.val.link._, node_ = Gun.node._;
    	})(USE, './chain');
    USE(function(module){
    		var Gun = USE('./root');
    		Gun.chain.get = function(key, cb, as){
    			var gun, tmp;
    			if(typeof key === 'string'){
    				var back = this, cat = back._;
    				var next = cat.next || empty;
    				if(!(gun = next[key])){
    					gun = cache(key, back);
    				}
    				gun = gun.$;
    			} else
    			if(key instanceof Function){
    				if(true === cb){ return soul(this, key, cb, as) }
    				gun = this;
    				var at = gun._, root = at.root, tmp = root.now, ev;
    				as = cb || {};
    				as.at = at;
    				as.use = key;
    				as.out = as.out || {};
    				as.out.get = as.out.get || {};
    				(ev = at.on('in', use, as)).rid = rid;
    				(root.now = {$:1})[as.now = at.id] = ev;
    				var mum = root.mum; root.mum = {};
    				at.on('out', as.out);
    				root.mum = mum;
    				root.now = tmp;
    				return gun;
    			} else
    			if(num_is(key)){
    				return this.get(''+key, cb, as);
    			} else
    			if(tmp = rel.is(key)){
    				return this.get(tmp, cb, as);
    			} else
    			if(obj.is(key)){
    				gun = this;
    				if(tmp = ((tmp = key['#'])||empty)['='] || tmp){ gun = gun.get(tmp); }
    				gun._.lex = key;
    				return gun;
    			} else {
    				(as = this.chain())._.err = {err: Gun.log('Invalid get request!', key)}; // CLEAN UP
    				if(cb){ cb.call(as, as._.err); }
    				return as;
    			}
    			if(tmp = this._.stun){ // TODO: Refactor?
    				gun._.stun = gun._.stun || tmp;
    			}
    			if(cb && cb instanceof Function){
    				gun.get(cb, as);
    			}
    			return gun;
    		};
    		function cache(key, back){
    			var cat = back._, next = cat.next, gun = back.chain(), at = gun._;
    			if(!next){ next = cat.next = {}; }
    			next[at.get = key] = at;
    			if(back === cat.root.$){
    				at.soul = key;
    			} else
    			if(cat.soul || cat.has){
    				at.has = key;
    				//if(obj_has(cat.put, key)){
    					//at.put = cat.put[key];
    				//}
    			}
    			return at;
    		}
    		function soul(gun, cb, opt, as){
    			var cat = gun._, acks = 0, tmp;
    			if(tmp = cat.soul || cat.link || cat.dub){ return cb(tmp, as, cat), gun }
    			gun.get(function(msg, ev){
    				if(u === msg.put && (tmp = (obj_map(cat.root.opt.peers, function(v,k,t){t(k);})||[]).length) && ++acks < tmp){
    					return;
    				}
    				ev.rid(msg);
    				var at = ((at = msg.$) && at._) || {};
    				tmp = at.link || at.soul || rel.is(msg.put) || node_soul(msg.put) || at.dub;
    				cb(tmp, as, msg, ev);
    			}, {out: {get: {'.':true}}});
    			return gun;
    		}
    		function use(msg){
    			var eve = this, as = eve.as, cat = as.at, root = cat.root, gun = msg.$, at = (gun||{})._ || {}, data = msg.put || at.put, tmp;
    			if((tmp = root.now) && eve !== tmp[as.now]){ return eve.to.next(msg) }
    			//console.log("USE:", cat.id, cat.soul, cat.has, cat.get, msg, root.mum);
    			//if(at.async && msg.root){ return }
    			//if(at.async === 1 && cat.async !== true){ return }
    			//if(root.stop && root.stop[at.id]){ return } root.stop && (root.stop[at.id] = true);
    			//if(!at.async && !cat.async && at.put && msg.put === at.put){ return }
    			//else if(!cat.async && msg.put !== at.put && root.stop && root.stop[at.id]){ return } root.stop && (root.stop[at.id] = true);


    			//root.stop && (root.stop.id = root.stop.id || Gun.text.random(2));
    			//if((tmp = root.stop) && (tmp = tmp[at.id] || (tmp[at.id] = {})) && tmp[cat.id]){ return } tmp && (tmp[cat.id] = true);
    			if(eve.seen && at.id && eve.seen[at.id]){ return eve.to.next(msg) }
    			//if((tmp = root.stop)){ if(tmp[at.id]){ return } tmp[at.id] = msg.root; } // temporary fix till a better solution?
    			if((tmp = data) && tmp[rel._] && (tmp = rel.is(tmp))){
    				tmp = ((msg.$$ = at.root.gun.get(tmp))._);
    				if(u !== tmp.put){
    					msg = obj_to(msg, {put: data = tmp.put});
    				}
    			}
    			if((tmp = root.mum) && at.id){ // TODO: can we delete mum entirely now?
    				var id = at.id + (eve.id || (eve.id = Gun.text.random(9)));
    				if(tmp[id]){ return }
    				if(u !== data && !rel.is(data)){ tmp[id] = true; }
    			}
    			as.use(msg, eve);
    			if(eve.stun){
    				eve.stun = null;
    				return;
    			}
    			eve.to.next(msg);
    		}
    		function rid(at){
    			var cat = this.on;
    			if(!at || cat.soul || cat.has){ return this.off() }
    			if(!(at = (at = (at = at.$ || at)._ || at).id)){ return }
    			var map = cat.map, tmp, seen;
    			//if(!map || !(tmp = map[at]) || !(tmp = tmp.at)){ return }
    			if(tmp = (seen = this.seen || (this.seen = {}))[at]){ return true }
    			seen[at] = true;
    			return;
    		}
    		var obj = Gun.obj, obj_map = obj.map, obj_has = obj.has, obj_to = Gun.obj.to;
    		var num_is = Gun.num.is;
    		var rel = Gun.val.link, node_soul = Gun.node.soul, node_ = Gun.node._;
    		var empty = {}, u;
    	})(USE, './get');
    USE(function(module){
    		var Gun = USE('./root');
    		Gun.chain.put = function(data, cb, as){
    			// #soul.has=value>state
    			// ~who#where.where=what>when@was
    			// TODO: BUG! Put probably cannot handle plural chains!
    			var gun = this, at = (gun._), root = at.root.$, ctx = root._, M = 100, tmp;
    			if(!ctx.puta){ if(tmp = ctx.puts){ if(tmp > M){ // without this, when synchronous, writes to a 'not found' pile up, when 'not found' resolves it recursively calls `put` which incrementally resolves each write. Stack overflow limits can be as low as 10K, so this limit is hardcoded to 1% of 10K.
    				(ctx.stack || (ctx.stack = [])).push([gun, data, cb, as]);
    				if(ctx.puto){ return }
    				ctx.puto = setTimeout(function drain(){
    					var d = ctx.stack.splice(0,M), i = 0, at; ctx.puta = true;
    					while(at = d[i++]){ at[0].put(at[1], at[2], at[3]); } delete ctx.puta;
    					if(ctx.stack.length){ return ctx.puto = setTimeout(drain, 0) }
    					ctx.stack = ctx.puts = ctx.puto = null;
    				}, 0);
    				return gun;
    			} ++ctx.puts; } else { ctx.puts = 1; } }
    			as = as || {};
    			as.data = data;
    			as.via = as.$ = as.via || as.$ || gun;
    			if(typeof cb === 'string'){
    				as.soul = cb;
    			} else {
    				as.ack = as.ack || cb;
    			}
    			if(at.soul){
    				as.soul = at.soul;
    			}
    			if(as.soul || root === gun){
    				if(!obj_is(as.data)){
    					(as.ack||noop).call(as, as.out = {err: Gun.log("Data saved to the root level of the graph must be a node (an object), not a", (typeof as.data), 'of "' + as.data + '"!')});
    					if(as.res){ as.res(); }
    					return gun;
    				}
    				as.soul = as.soul || (as.not = Gun.node.soul(as.data) || (as.via.back('opt.uuid') || Gun.text.random)());
    				if(!as.soul){ // polyfill async uuid for SEA
    					as.via.back('opt.uuid')(function(err, soul){ // TODO: improve perf without anonymous callback
    						if(err){ return Gun.log(err) } // TODO: Handle error!
    						(as.ref||as.$).put(as.data, as.soul = soul, as);
    					});
    					return gun;
    				}
    				as.$ = root.get(as.soul);
    				as.ref = as.$;
    				ify(as);
    				return gun;
    			}
    			if(Gun.is(data)){
    				data.get(function(soul, o, msg){
    					if(!soul){
    						return Gun.log("The reference you are saving is a", typeof msg.put, '"'+ msg.put +'", not a node (object)!');
    					}
    					gun.put(Gun.val.link.ify(soul), cb, as);
    				}, true);
    				return gun;
    			}
    			if(at.has && (tmp = Gun.val.link.is(data))){ at.dub = tmp; }
    			as.ref = as.ref || (root._ === (tmp = at.back))? gun : tmp.$;
    			if(as.ref._.soul && Gun.val.is(as.data) && at.get){
    				as.data = obj_put({}, at.get, as.data);
    				as.ref.put(as.data, as.soul, as);
    				return gun;
    			}
    			as.ref.get(any, true, {as: as});
    			if(!as.out){
    				// TODO: Perf idea! Make a global lock, that blocks everything while it is on, but if it is on the lock it does the expensive lookup to see if it is a dependent write or not and if not then it proceeds full speed. Meh? For write heavy async apps that would be terrible.
    				as.res = as.res || stun; // Gun.on.stun(as.ref); // TODO: BUG! Deal with locking?
    				as.$._.stun = as.ref._.stun;
    			}
    			return gun;
    		};

    		function ify(as){
    			as.batch = batch;
    			var opt = as.opt||{}, env = as.env = Gun.state.map(map, opt.state);
    			env.soul = as.soul;
    			as.graph = Gun.graph.ify(as.data, env, as);
    			if(env.err){
    				(as.ack||noop).call(as, as.out = {err: Gun.log(env.err)});
    				if(as.res){ as.res(); }
    				return;
    			}
    			as.batch();
    		}

    		function stun(cb){
    			if(cb){ cb(); }
    			return;
    		}

    		function batch(){ var as = this;
    			if(!as.graph || obj_map(as.stun, no)){ return }
    			as.res = as.res || function(cb){ if(cb){ cb(); } };
    			as.res(function(){
    				var cat = (as.$.back(-1)._), ask = cat.ask(function(ack){
    					cat.root.on('ack', ack);
    					if(ack.err){ Gun.log(ack); }
    					if(!ack.lack){ this.off(); } // One response is good enough for us currently. Later we may want to adjust this.
    					if(!as.ack){ return }
    					as.ack(ack, this);
    					//--C;
    				}, as.opt);
    				//C++;
    				// NOW is a hack to get synchronous replies to correctly call.
    				// and STOP is a hack to get async behavior to correctly call.
    				// neither of these are ideal, need to be fixed without hacks,
    				// but for now, this works for current tests. :/
    				var tmp = cat.root.now; obj.del(cat.root, 'now');
    				var mum = cat.root.mum; cat.root.mum = {};
    				(as.ref._).on('out', {
    					$: as.ref, put: as.out = as.env.graph, opt: as.opt, '#': ask
    				});
    				cat.root.mum = mum? obj.to(mum, cat.root.mum) : mum;
    				cat.root.now = tmp;
    			}, as);
    			if(as.res){ as.res(); }
    		} function no(v,k){ if(v){ return true } }
    		//console.debug(999,1); var C = 0; setInterval(function(){ try{ debug.innerHTML = C }catch(e){console.log(e)} }, 500);

    		function map(v,k,n, at){ var as = this;
    			var is = Gun.is(v);
    			if(k || !at.path.length){ return }
    			(as.res||iife)(function(){
    				var path = at.path, ref = as.ref, opt = as.opt;
    				var i = 0, l = path.length;
    				for(i; i < l; i++){
    					ref = ref.get(path[i]);
    				}
    				if(is){ ref = v; }
    				var id = (ref._).dub;
    				if(id || (id = Gun.node.soul(at.obj))){
    					ref.back(-1).get(id);
    					at.soul(id);
    					return;
    				}
    				(as.stun = as.stun || {})[path] = true;
    				ref.get(soul, true, {as: {at: at, as: as, p:path}});
    			}, {as: as, at: at});
    			//if(is){ return {} }
    		}

    		function soul(id, as, msg, eve){
    			var as = as.as, cat = as.at; as = as.as;
    			var at = ((msg || {}).$ || {})._ || {};
    			id = at.dub = at.dub || id || Gun.node.soul(cat.obj) || Gun.node.soul(msg.put || at.put) || Gun.val.link.is(msg.put || at.put) || (as.via.back('opt.uuid') || Gun.text.random)(); // TODO: BUG!? Do we really want the soul of the object given to us? Could that be dangerous?
    			if(eve){ eve.stun = true; }
    			if(!id){ // polyfill async uuid for SEA
    				at.via.back('opt.uuid')(function(err, id){ // TODO: improve perf without anonymous callback
    					if(err){ return Gun.log(err) } // TODO: Handle error.
    					solve(at, at.dub = at.dub || id, cat, as);
    				});
    				return;
    			}
    			solve(at, at.dub = id, cat, as);
    		}

    		function solve(at, id, cat, as){
    			at.$.back(-1).get(id);
    			cat.soul(id);
    			as.stun[cat.path] = false;
    			as.batch();
    		}

    		function any(soul, as, msg, eve){
    			as = as.as;
    			if(!msg.$ || !msg.$._){ return } // TODO: Handle
    			if(msg.err){ // TODO: Handle
    				console.log("Please report this as an issue! Put.any.err");
    				return;
    			}
    			var at = (msg.$._), data = at.put, opt = as.opt||{}, tmp;
    			if((tmp = as.ref) && tmp._.now){ return }
    			if(eve){ eve.stun = true; }
    			if(as.ref !== as.$){
    				tmp = (as.$._).get || at.get;
    				if(!tmp){ // TODO: Handle
    					console.log("Please report this as an issue! Put.no.get"); // TODO: BUG!??
    					return;
    				}
    				as.data = obj_put({}, tmp, as.data);
    				tmp = null;
    			}
    			if(u === data){
    				if(!at.get){ return } // TODO: Handle
    				if(!soul){
    					tmp = at.$.back(function(at){
    						if(at.link || at.soul){ return at.link || at.soul }
    						as.data = obj_put({}, at.get, as.data);
    					});
    				}
    				tmp = tmp || at.soul || at.link || at.dub;// || at.get;
    				at = tmp? (at.root.$.get(tmp)._) : at;
    				as.soul = tmp;
    				data = as.data;
    			}
    			if(!as.not && !(as.soul = as.soul || soul)){
    				if(as.path && obj_is(as.data)){
    					as.soul = (opt.uuid || as.via.back('opt.uuid') || Gun.text.random)();
    				} else {
    					//as.data = obj_put({}, as.$._.get, as.data);
    					if(node_ == at.get){
    						as.soul = (at.put||empty)['#'] || at.dub;
    					}
    					as.soul = as.soul || at.soul || at.link || (opt.uuid || as.via.back('opt.uuid') || Gun.text.random)();
    				}
    				if(!as.soul){ // polyfill async uuid for SEA
    					as.via.back('opt.uuid')(function(err, soul){ // TODO: improve perf without anonymous callback
    						if(err){ return Gun.log(err) } // Handle error.
    						as.ref.put(as.data, as.soul = soul, as);
    					});
    					return;
    				}
    			}
    			as.ref.put(as.data, as.soul, as);
    		}
    		var obj = Gun.obj, obj_is = obj.is, obj_put = obj.put, obj_map = obj.map;
    		var u, empty = {}, noop = function(){}, iife = function(fn,as){fn.call(as||empty);};
    		var node_ = Gun.node._;
    	})(USE, './put');
    USE(function(module){
    		var Gun = USE('./root');
    		USE('./chain');
    		USE('./back');
    		USE('./put');
    		USE('./get');
    		module.exports = Gun;
    	})(USE, './index');
    USE(function(module){
    		var Gun = USE('./index');
    		Gun.chain.on = function(tag, arg, eas, as){
    			var gun = this, at = gun._, act;
    			if(typeof tag === 'string'){
    				if(!arg){ return at.on(tag) }
    				act = at.on(tag, arg, eas || at, as);
    				if(eas && eas.$){
    					(eas.subs || (eas.subs = [])).push(act);
    				}
    				return gun;
    			}
    			var opt = arg;
    			opt = (true === opt)? {change: true} : opt || {};
    			opt.at = at;
    			opt.ok = tag;
    			//opt.last = {};
    			gun.get(ok, opt); // TODO: PERF! Event listener leak!!!?
    			return gun;
    		};

    		function ok(msg, ev){ var opt = this;
    			var gun = msg.$, at = (gun||{})._ || {}, data = at.put || msg.put, cat = opt.at, tmp;
    			if(u === data){
    				return;
    			}
    			if(tmp = msg.$$){
    				tmp = (msg.$$._);
    				if(u === tmp.put){
    					return;
    				}
    				data = tmp.put;
    			}
    			if(opt.change){ // TODO: BUG? Move above the undef checks?
    				data = msg.put;
    			}
    			// DEDUPLICATE // TODO: NEEDS WORK! BAD PROTOTYPE
    			//if(tmp.put === data && tmp.get === id && !Gun.node.soul(data)){ return }
    			//tmp.put = data;
    			//tmp.get = id;
    			// DEDUPLICATE // TODO: NEEDS WORK! BAD PROTOTYPE
    			//at.last = data;
    			if(opt.as){
    				opt.ok.call(opt.as, msg, ev);
    			} else {
    				opt.ok.call(gun, data, msg.get, msg, ev);
    			}
    		}

    		Gun.chain.val = function(cb, opt){
    			Gun.log.once("onceval", "Future Breaking API Change: .val -> .once, apologies unexpected.");
    			return this.once(cb, opt);
    		};
    		Gun.chain.once = function(cb, opt){
    			var gun = this, at = gun._, data = at.put;
    			if(0 < at.ack && u !== data){
    				(cb || noop).call(gun, data, at.get);
    				return gun;
    			}
    			if(cb){
    				(opt = opt || {}).ok = cb;
    				opt.at = at;
    				opt.out = {'#': Gun.text.random(9)};
    				gun.get(val, {as: opt});
    				opt.async = true; //opt.async = at.stun? 1 : true;
    			} else {
    				Gun.log.once("valonce", "Chainable val is experimental, its behavior and API may change moving forward. Please play with it and report bugs and ideas on how to improve it.");
    				var chain = gun.chain();
    				chain._.nix = gun.once(function(){
    					chain._.on('in', gun._);
    				});
    				return chain;
    			}
    			return gun;
    		};

    		function val(msg, eve, to){
    			if(!msg.$){ eve.off(); return }
    			var opt = this.as, cat = opt.at, gun = msg.$, at = gun._, data = at.put || msg.put, link, tmp;
    			if(tmp = msg.$$){
    				link = tmp = (msg.$$._);
    				if(u !== link.put){
    					data = link.put;
    				}
    			}
    			if((tmp = eve.wait) && (tmp = tmp[at.id])){ clearTimeout(tmp); }
    			if((!to && (u === data || at.soul || at.link || (link && !(0 < link.ack))))
    			|| (u === data && (tmp = (obj_map(at.root.opt.peers, function(v,k,t){t(k);})||[]).length) && (!to && (link||at).ack <= tmp))){
    				tmp = (eve.wait = {})[at.id] = setTimeout(function(){
    					val.call({as:opt}, msg, eve, tmp || 1);
    				}, opt.wait || 99);
    				return;
    			}
    			if(link && u === link.put && (tmp = rel.is(data))){ data = Gun.node.ify({}, tmp); }
    			eve.rid(msg);
    			opt.ok.call(gun || opt.$, data, msg.get);
    		}

    		Gun.chain.off = function(){
    			// make off more aggressive. Warning, it might backfire!
    			var gun = this, at = gun._, tmp;
    			var cat = at.back;
    			if(!cat){ return }
    			if(tmp = cat.next){
    				if(tmp[at.get]){
    					obj_del(tmp, at.get);
    				}
    			}
    			if(tmp = cat.ask){
    				obj_del(tmp, at.get);
    			}
    			if(tmp = cat.put){
    				obj_del(tmp, at.get);
    			}
    			if(tmp = at.soul){
    				obj_del(cat.root.graph, tmp);
    			}
    			if(tmp = at.map){
    				obj_map(tmp, function(at){
    					if(at.link){
    						cat.root.$.get(at.link).off();
    					}
    				});
    			}
    			if(tmp = at.next){
    				obj_map(tmp, function(neat){
    					neat.$.off();
    				});
    			}
    			at.on('off', {});
    			return gun;
    		};
    		var obj = Gun.obj, obj_map = obj.map, obj_has = obj.has, obj_del = obj.del, obj_to = obj.to;
    		var rel = Gun.val.link;
    		var noop = function(){}, u;
    	})(USE, './on');
    USE(function(module){
    		var Gun = USE('./index');
    		Gun.chain.map = function(cb, opt, t){
    			var gun = this, cat = gun._, chain;
    			if(!cb){
    				if(chain = cat.each){ return chain }
    				cat.each = chain = gun.chain();
    				chain._.nix = gun.back('nix');
    				gun.on('in', map, chain._);
    				return chain;
    			}
    			Gun.log.once("mapfn", "Map functions are experimental, their behavior and API may change moving forward. Please play with it and report bugs and ideas on how to improve it.");
    			chain = gun.chain();
    			gun.map().on(function(data, key, at, ev){
    				var next = (cb||noop).call(this, data, key, at, ev);
    				if(u === next){ return }
    				if(data === next){ return chain._.on('in', at) }
    				if(Gun.is(next)){ return chain._.on('in', next._) }
    				chain._.on('in', {get: key, put: next});
    			});
    			return chain;
    		};
    		function map(msg){
    			if(!msg.put || Gun.val.is(msg.put)){ return this.to.next(msg) }
    			if(this.as.nix){ this.off(); } // TODO: Ugly hack!
    			obj_map(msg.put, each, {at: this.as, msg: msg});
    			this.to.next(msg);
    		}
    		function each(v,k){
    			if(n_ === k){ return }
    			var msg = this.msg, gun = msg.$, at = gun._, cat = this.at, tmp = at.lex;
    			if(tmp && !Gun.text.match(k, tmp['.'] || tmp['#'] || tmp)){ return } // review?
    			((tmp = gun.get(k)._).echo || (tmp.echo = {}))[cat.id] = tmp.echo[cat.id] || cat;
    		}
    		var obj_map = Gun.obj.map, noop = function(){}, n_ = Gun.node._, u;
    	})(USE, './map');
    USE(function(module){
    		var Gun = USE('./index');
    		Gun.chain.set = function(item, cb, opt){
    			var gun = this, soul;
    			cb = cb || function(){};
    			opt = opt || {}; opt.item = opt.item || item;
    			if(soul = Gun.node.soul(item)){ item = Gun.obj.put({}, soul, Gun.val.link.ify(soul)); }
    			if(!Gun.is(item)){
    				if(Gun.obj.is(item)){					item = gun.back(-1).get(soul = soul || Gun.node.soul(item) || gun.back('opt.uuid')()).put(item);
    				}
    				return gun.get(soul || (Gun.state.lex() + Gun.text.random(7))).put(item, cb, opt);
    			}
    			item.get(function(soul, o, msg){
    				if(!soul){ return cb.call(gun, {err: Gun.log('Only a node can be linked! Not "' + msg.put + '"!')}) }
    				gun.put(Gun.obj.put({}, soul, Gun.val.link.ify(soul)), cb, opt);
    			},true);
    			return item;
    		};
    	})(USE, './set');
    USE(function(module){
    		if(typeof Gun === 'undefined'){ return } // TODO: localStorage is Browser only. But it would be nice if it could somehow plugin into NodeJS compatible localStorage APIs?

    		var noop = function(){}, store;
    		try{store = (Gun.window||noop).localStorage;}catch(e){}
    		if(!store){
    			console.log("Warning: No localStorage exists to persist data to!");
    			store = {setItem: function(k,v){this[k]=v;}, removeItem: function(k){delete this[k];}, getItem: function(k){return this[k]}};
    		}
    		/*
    			NOTE: Both `lib/file.js` and `lib/memdisk.js` are based on this design!
    			If you update anything here, consider updating the other adapters as well.
    		*/

    		Gun.on('create', function(root){
    			// This code is used to queue offline writes for resync.
    			// See the next 'opt' code below for actual saving of data.
    			var ev = this.to, opt = root.opt;
    			if(root.once){ return ev.next(root) }
    			//if(false === opt.localStorage){ return ev.next(root) } // we want offline resynce queue regardless!
    			opt.prefix = opt.file || 'gun/';
    			var gap = Gun.obj.ify(store.getItem('gap/'+opt.prefix)) || {};
    			var empty = Gun.obj.empty, id, to;
    			// add re-sync command.
    			if(!empty(gap)){
    				var disk = Gun.obj.ify(store.getItem(opt.prefix)) || {}, send = {};
    				Gun.obj.map(gap, function(node, soul){
    					Gun.obj.map(node, function(val, key){
    						send[soul] = Gun.state.to(disk[soul], key, send[soul]);
    					});
    				});
    				setTimeout(function(){
    					root.on('out', {put: send, '#': root.ask(ack)});
    				},1);
    			}

    			root.on('out', function(msg){
    				if(msg.lS){ return }
    				if(Gun.is(msg.$) && msg.put && !msg['@'] && !empty(opt.peers)){
    					id = msg['#'];
    					Gun.graph.is(msg.put, null, map);
    					if(!to){ to = setTimeout(flush, opt.wait || 1); }
    				}
    				this.to.next(msg);
    			});
    			root.on('ack', ack);

    			function ack(ack){ // TODO: This is experimental, not sure if we should keep this type of event hook.
    				if(ack.err || !ack.ok){ return }
    				var id = ack['@'];
    				setTimeout(function(){
    					Gun.obj.map(gap, function(node, soul){
    						Gun.obj.map(node, function(val, key){
    							if(id !== val){ return }
    							delete node[key];
    						});
    						if(empty(node)){
    							delete gap[soul];
    						}
    					});
    					flush();
    				}, opt.wait || 1);
    			}			ev.next(root);

    			var map = function(val, key, node, soul){
    				(gap[soul] || (gap[soul] = {}))[key] = id;
    			};
    			var flush = function(){
    				clearTimeout(to);
    				to = false;
    				try{store.setItem('gap/'+opt.prefix, JSON.stringify(gap));
    				}catch(e){ Gun.log(err = e || "localStorage failure"); }
    			};
    		});

    		Gun.on('create', function(root){
    			this.to.next(root);
    			var opt = root.opt;
    			if(root.once){ return }
    			if(false === opt.localStorage){ return }
    			opt.prefix = opt.file || 'gun/';
    			var graph = root.graph, acks = {}, count = 0, to;
    			var disk = Gun.obj.ify(store.getItem(opt.prefix)) || {};
    			root.on('localStorage', disk); // NON-STANDARD EVENT!

    			root.on('put', function(at){
    				this.to.next(at);
    				Gun.graph.is(at.put, null, map);
    				if(!at['@']){ acks[at['#']] = true; } // only ack non-acks.
    				count += 1;
    				if(count >= (opt.batch || 1000)){
    					return flush();
    				}
    				if(to){ return }
    				to = setTimeout(flush, opt.wait || 1);
    			});

    			root.on('get', function(msg){
    				this.to.next(msg);
    				var lex = msg.get, soul, data, u;
    				function to(){
    				if(!lex || !(soul = lex['#'])){ return }
    				//if(0 >= msg.cap){ return }
    				var has = lex['.'];
    				data = disk[soul] || u;
    				if(data && has){
    					data = Gun.state.to(data, has);
    				}
    				if(!data && !Gun.obj.empty(opt.peers)){ // if data not found, don't ack if there are peers.
    					return; // Hmm, what if we have peers but we are disconnected?
    				}
    				//console.log("lS get", lex, data);
    				root.on('in', {'@': msg['#'], put: Gun.graph.node(data), how: 'lS', lS: msg.$ || root.$});
    				}				Gun.debug? setTimeout(to,1) : to();
    			});

    			var map = function(val, key, node, soul){
    				disk[soul] = Gun.state.to(node, key, disk[soul]);
    			};

    			var flush = function(data){
    				var err;
    				count = 0;
    				clearTimeout(to);
    				to = false;
    				var ack = acks;
    				acks = {};
    				if(data){ disk = data; }
    				try{store.setItem(opt.prefix, JSON.stringify(disk));
    				}catch(e){
    					Gun.log(err = (e || "localStorage failure") + " Consider using GUN's IndexedDB plugin for RAD for more storage space, temporary example at https://github.com/amark/gun/blob/master/test/tmp/indexedDB.html .");
    					root.on('localStorage:error', {err: err, file: opt.prefix, flush: disk, retry: flush});
    				}
    				if(!err && !Gun.obj.empty(opt.peers)){ return } // only ack if there are no peers.
    				Gun.obj.map(ack, function(yes, id){
    					root.on('in', {
    						'@': id,
    						err: err,
    						ok: 0 // localStorage isn't reliable, so make its `ok` code be a low number.
    					});
    				});
    			};
    		});
    	})(USE, './adapters/localStorage');
    USE(function(module){
    		var Gun = USE('../index');
    		var Type = USE('../type');

    		function Mesh(ctx){
    			var mesh = function(){};
    			var opt = ctx.opt || {};
    			opt.log = opt.log || console.log;
    			opt.gap = opt.gap || opt.wait || 1;
    			opt.pack = opt.pack || (opt.memory? (opt.memory * 1000 * 1000) : 1399000000) * 0.3; // max_old_space_size defaults to 1400 MB.

    			mesh.out = function(msg){ var tmp;
    				if(this.to){ this.to.next(msg); }
    				//if(mesh.last != msg['#']){ return mesh.last = msg['#'], this.to.next(msg) }
    				if((tmp = msg['@'])
    				&& (tmp = ctx.dup.s[tmp])
    				&& (tmp = tmp.it)
    				&& tmp._){
    					mesh.say(msg, (tmp._).via, 1);
    					tmp['##'] = msg['##'];
    					return;
    				}
    				// add hook for AXE?
    				if (Gun.AXE) { Gun.AXE.say(msg, mesh.say, this); return; }
    				mesh.say(msg);
    			};

    			ctx.on('create', function(root){
    				root.opt.pid = root.opt.pid || Type.text.random(9);
    				this.to.next(root);
    				ctx.on('out', mesh.out);
    			});

    			mesh.hear = function(raw, peer){
    				if(!raw){ return }
    				var dup = ctx.dup, id, hash, msg, tmp = raw[0];
    				if(opt.pack <= raw.length){ return mesh.say({dam: '!', err: "Message too big!"}, peer) }
    				if('{' === tmp){
    					try{msg = JSON.parse(raw);}catch(e){opt.log('DAM JSON parse error', e);}
    					if(!msg){ return }
    					if(dup.check(id = msg['#'])){ return }
    					dup.track(id, true).it = msg; // GUN core also dedups, so `true` is needed.
    					if((tmp = msg['@']) && msg.put){
    						hash = msg['##'] || (msg['##'] = mesh.hash(msg));
    						if((tmp = tmp + hash) != id){
    							if(dup.check(tmp)){ return }
    							(tmp = dup.s)[hash] = tmp[id];
    						}
    					}
    					(msg._ = function(){}).via = peer;
    					if((tmp = msg['><'])){
    						(msg._).to = Type.obj.map(tmp.split(','), function(k,i,m){m(k,true);});
    					}
    					if(msg.dam){
    						if(tmp = mesh.hear[msg.dam]){
    							tmp(msg, peer, ctx);
    						}
    						return;
    					}
    					ctx.on('in', msg);

    					return;
    				} else
    				if('[' === tmp){
    					try{msg = JSON.parse(raw);}catch(e){opt.log('DAM JSON parse error', e);}
    					if(!msg){ return }
    					var i = 0, m;
    					while(m = msg[i++]){
    						mesh.hear(m, peer);
    					}

    					return;
    				}
    			}

    			;(function(){
    				mesh.say = function(msg, peer, o){
    					/*
    						TODO: Plenty of performance optimizations
    						that can be made just based off of ordering,
    						and reducing function calls for cached writes.
    					*/
    					if(!peer){
    						Type.obj.map(opt.peers, function(peer){
    							mesh.say(msg, peer);
    						});
    						return;
    					}
    					var tmp, wire = peer.wire || ((opt.wire) && opt.wire(peer)), msh, raw;// || open(peer, ctx); // TODO: Reopen!
    					if(!wire){ return }
    					msh = (msg._) || empty;
    					if(peer === msh.via){ return }
    					if(!(raw = msh.raw)){ raw = mesh.raw(msg); }
    					if((tmp = msg['@'])
    					&& (tmp = ctx.dup.s[tmp])
    					&& (tmp = tmp.it)){
    						if(tmp.get && tmp['##'] && tmp['##'] === msg['##']){ // PERF: move this condition outside say?
    							return; // TODO: this still needs to be tested in the browser!
    						}
    					}
    					if((tmp = msh.to) && (tmp[peer.url] || tmp[peer.id]) && !o){ return } // TODO: still needs to be tested
    					if(peer.batch){
    						peer.tail = (peer.tail || 0) + raw.length;
    						if(peer.tail <= opt.pack){
    							peer.batch.push(raw);
    							return;
    						}
    						flush(peer);
    					}
    					peer.batch = [];
    					setTimeout(function(){flush(peer);}, opt.gap);
    					send(raw, peer);
    				};
    				function flush(peer){
    					var tmp = peer.batch;
    					if(!tmp){ return }
    					peer.batch = peer.tail = null;
    					if(!tmp.length){ return }
    					try{send(JSON.stringify(tmp), peer);
    					}catch(e){opt.log('DAM JSON stringify error', e);}
    				}
    				function send(raw, peer){
    					var wire = peer.wire;
    					try{
    						if(peer.say){
    							peer.say(raw);
    						} else
    						if(wire.send){
    							wire.send(raw);
    						}
    					}catch(e){
    						(peer.queue = peer.queue || []).push(raw);
    					}
    				}

    			}());
    (function(){

    				mesh.raw = function(msg){
    					if(!msg){ return '' }
    					var dup = ctx.dup, msh = (msg._) || {}, put, hash, tmp;
    					if(tmp = msh.raw){ return tmp }
    					if(typeof msg === 'string'){ return msg }
    					if(msg['@'] && (tmp = msg.put)){
    						if(!(hash = msg['##'])){
    							put = $(tmp, sort) || '';
    							hash = mesh.hash(msg, put);
    							msg['##'] = hash;
    						}
    						(tmp = dup.s)[hash = msg['@']+hash] = tmp[msg['#']];
    						msg['#'] = hash || msg['#'];
    						if(put){ (msg = Type.obj.to(msg)).put = _; }
    					}
    					var i = 0, to = []; Type.obj.map(opt.peers, function(p){
    						to.push(p.url || p.id); if(++i > 9){ return true } // limit server, fast fix, improve later!
    					}); msg['><'] = to.join();
    					var raw = $(msg);
    					if(u !== put){
    						tmp = raw.indexOf(_, raw.indexOf('put'));
    						raw = raw.slice(0, tmp-1) + put + raw.slice(tmp + _.length + 1);
    						//raw = raw.replace('"'+ _ +'"', put); // https://github.com/amark/gun/wiki/@$$ Heisenbug
    					}
    					if(msh){
    						msh.raw = raw;
    					}
    					return raw;
    				};

    				mesh.hash = function(msg, hash){
    					return Mesh.hash(hash || $(msg.put, sort) || '') || msg['#'] || Type.text.random(9);
    				};

    				function sort(k, v){ var tmp;
    					if(!(v instanceof Object)){ return v }
    					Type.obj.map(Object.keys(v).sort(), map, {to: tmp = {}, on: v});
    					return tmp;
    				}

    				function map(k){
    					this.to[k] = this.on[k];
    				}
    				var $ = JSON.stringify, _ = ':])([:';

    			}());

    			mesh.hi = function(peer){
    				var tmp = peer.wire || {};
    				if(peer.id || peer.url){
    					opt.peers[peer.url || peer.id] = peer;
    					Type.obj.del(opt.peers, tmp.id);
    				} else {
    					tmp = tmp.id = tmp.id || Type.text.random(9);
    					mesh.say({dam: '?'}, opt.peers[tmp] = peer);
    				}
    				if(!tmp.hied){ ctx.on(tmp.hied = 'hi', peer); }
    				// tmp = peer.queue; peer.queue = [];
    				// Type.obj.map(tmp, function(msg){
    				// 	mesh.say(msg, peer);
    				// });
    			};
    			mesh.bye = function(peer){
    				Type.obj.del(opt.peers, peer.id); // assume if peer.url then reconnect
    				ctx.on('bye', peer);
    			};
    			mesh.hear['!'] = function(msg, peer){ opt.log('Error:', msg.err); };
    			mesh.hear['?'] = function(msg, peer){
    				if(!msg.pid){
    // 					return mesh.say({dam: '?', pid: opt.pid, '@': msg['#']}, peer);
    					mesh.say({dam: '?', pid: opt.pid, '@': msg['#']}, peer);
    					var tmp = peer.queue; peer.queue = [];
    					Type.obj.map(tmp, function(msg){
    						mesh.say(msg, peer);
    					});
    					return;
    				}
    				peer.id = peer.id || msg.pid;
    				mesh.hi(peer);
    			};
    			return mesh;
    		}

    		Mesh.hash = function(s){ // via SO
    			if(typeof s !== 'string'){ return {err: 1} }
    	    var c = 0;
    	    if(!s.length){ return c }
    	    for(var i=0,l=s.length,n; i<l; ++i){
    	      n = s.charCodeAt(i);
    	      c = ((c<<5)-c)+n;
    	      c |= 0;
    	    }
    	    return c; // Math.abs(c);
    	  };

    	  var empty = {}, u;
    	  Object.keys = Object.keys || function(o){ return map(o, function(v,k,t){t(k);}) };

    	  try{ module.exports = Mesh; }catch(e){}

    	})(USE, './adapters/mesh');
    USE(function(module){
    		var Gun = USE('../index');
    		Gun.Mesh = USE('./mesh');

    		Gun.on('opt', function(root){
    			this.to.next(root);
    			var opt = root.opt;
    			if(root.once){ return }
    			if(false === opt.WebSocket){ return }

    			var env;
    			if(typeof window !== "undefined"){ env = window; }
    			if(typeof commonjsGlobal !== "undefined"){ env = commonjsGlobal; }
    			env = env || {};

    			var websocket = opt.WebSocket || env.WebSocket || env.webkitWebSocket || env.mozWebSocket;
    			if(!websocket){ return }
    			opt.WebSocket = websocket;

    			var mesh = opt.mesh = opt.mesh || Gun.Mesh(root);

    			var wire = opt.wire;
    			opt.wire = open;
    			function open(peer){ try{
    				if(!peer || !peer.url){ return wire && wire(peer) }
    				var url = peer.url.replace('http', 'ws');
    				var wire = peer.wire = new opt.WebSocket(url);
    				wire.onclose = function(){
    					opt.mesh.bye(peer);
    					reconnect(peer);
    				};
    				wire.onerror = function(error){
    					reconnect(peer); // placement?
    					if(!error){ return }
    					if(error.code === 'ECONNREFUSED'){
    						//reconnect(peer, as);
    					}
    				};
    				wire.onopen = function(){
    					opt.mesh.hi(peer);
    				};
    				wire.onmessage = function(msg){
    					if(!msg){ return }
    					opt.mesh.hear(msg.data || msg, peer);
    				};
    				return wire;
    			}catch(e){}}

    			function reconnect(peer){
    				clearTimeout(peer.defer);
    				peer.defer = setTimeout(function(){
    					open(peer);
    				}, 2 * 1000);
    			}
    		});
    	})(USE, './adapters/websocket');

    }());
    });

    function removeByMsgId(array, msgId) {
      for (let i in array) {
        if (array[i].msgId == msgId) {
          array.splice(i, 1);
          break;
        }
      }
    }

    function createStore() {
      const gun$1 = new gun([
        // "http://localhost:8765/gun",
        "https://phrassed.com/gun",
        "https://gunjs.herokuapp.com/gun",
      ]);

      const { subscribe, update } = writable([]);
      const chats = gun$1.get("chats");

      chats.map().on((val, msgId) => {
        update((state) => {
          if (!val) {
            removeByMsgId(state, msgId);
            return state;
          }

          if (val)
            state.push({
              msgId,
              msg: val.msg,
              time: parseFloat(val.time),
              user: val.user,
            });

          return state;
        });
      });

      return {
        subscribe,
        delete: (msgId) => {
          chats.get(msgId).put(null);
        },
        set: ({ msg, user }) => {
          const time = new Date().getTime();
          const msgId = `${time}_${Math.random()}`;
          chats.get(msgId).put({
            msg,
            user,
            time,
          });
        },
      };
    }

    const store = createStore();

    /* src/Page.svelte generated by Svelte v3.20.1 */
    const file = "src/Page.svelte";

    function create_fragment(ctx) {
    	let main;
    	let main_intro;
    	let main_outro;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			main = element("main");
    			if (default_slot) default_slot.c();
    			attr_dev(main, "class", "svelte-rnbruy");
    			add_location(main, file, 22, 0, 341);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);

    			if (default_slot) {
    				default_slot.m(main, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[0], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null));
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (main_outro) main_outro.end(1);
    				if (!main_intro) main_intro = create_in_transition(main, fade, {});
    				main_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (main_intro) main_intro.invalidate();
    			main_outro = create_out_transition(main, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && main_outro) main_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Page> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Page", $$slots, ['default']);

    	$$self.$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ user, fade });
    	return [$$scope, $$slots];
    }

    class Page extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Page",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/Nav.svelte generated by Svelte v3.20.1 */
    const file$1 = "src/Nav.svelte";

    // (33:2) {#if backTo}
    function create_if_block(ctx) {
    	let button;
    	let svg;
    	let title;
    	let t;
    	let path;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			svg = svg_element("svg");
    			title = svg_element("title");
    			t = text("Back");
    			path = svg_element("path");
    			add_location(title, file$1, 42, 8, 697);
    			attr_dev(path, "fill", "currentColor");
    			attr_dev(path, "d", "M13.7 15.3a1 1 0 0 1-1.4 1.4l-4-4a1 1 0 0 1 0-1.4l4-4a1 1 0 0 1 1.4\n          1.4L10.42 12l3.3 3.3z");
    			add_location(path, file$1, 43, 8, 725);
    			attr_dev(svg, "height", "40");
    			attr_dev(svg, "width", "40");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			add_location(svg, file$1, 37, 6, 573);
    			attr_dev(button, "class", "svelte-1wtft7r");
    			add_location(button, file$1, 33, 4, 502);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, button, anchor);
    			append_dev(button, svg);
    			append_dev(svg, title);
    			append_dev(title, t);
    			append_dev(svg, path);
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", /*click_handler*/ ctx[4], false, false, false);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(33:2) {#if backTo}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let t;
    	let h1;
    	let current;
    	let if_block = /*backTo*/ ctx[0] && create_if_block(ctx);
    	const default_slot_template = /*$$slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			t = space();
    			h1 = element("h1");
    			if (default_slot) default_slot.c();
    			attr_dev(h1, "class", "svelte-1wtft7r");
    			add_location(h1, file$1, 50, 2, 915);
    			attr_dev(div, "class", "nav svelte-1wtft7r");
    			add_location(div, file$1, 31, 0, 465);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t);
    			append_dev(div, h1);

    			if (default_slot) {
    				default_slot.m(h1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*backTo*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[2], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null));
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $nav;
    	validate_store(nav, "nav");
    	component_subscribe($$self, nav, $$value => $$invalidate(1, $nav = $$value));
    	let { backTo = null } = $$props;
    	const writable_props = ["backTo"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Nav> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Nav", $$slots, ['default']);

    	const click_handler = () => {
    		set_store_value(nav, $nav = backTo);
    	};

    	$$self.$set = $$props => {
    		if ("backTo" in $$props) $$invalidate(0, backTo = $$props.backTo);
    		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ nav, backTo, $nav });

    	$$self.$inject_state = $$props => {
    		if ("backTo" in $$props) $$invalidate(0, backTo = $$props.backTo);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [backTo, $nav, $$scope, $$slots, click_handler];
    }

    class Nav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { backTo: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Nav",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get backTo() {
    		throw new Error("<Nav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set backTo(value) {
    		throw new Error("<Nav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Message.svelte generated by Svelte v3.20.1 */
    const file$2 = "src/Message.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    // (133:2) <Nav backTo="settings">
    function create_default_slot_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Messages");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(133:2) <Nav backTo=\\\"settings\\\">",
    		ctx
    	});

    	return block;
    }

    // (135:4) {#each $store as val (val.msgId)}
    function create_each_block(key_1, ctx) {
    	let article;
    	let div_1;
    	let span0;
    	let t0_value = new Date(/*val*/ ctx[11].time).toLocaleString("en-US") + "";
    	let t0;
    	let t1;
    	let span1;
    	let t2_value = /*val*/ ctx[11].user + "";
    	let t2;
    	let t3;
    	let span2;
    	let t4_value = /*val*/ ctx[11].msg + "";
    	let t4;
    	let t5;
    	let button;
    	let t7;
    	let article_intro;
    	let article_outro;
    	let rect;
    	let stop_animation = noop;
    	let current;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[7](/*val*/ ctx[11], ...args);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			article = element("article");
    			div_1 = element("div");
    			span0 = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			span1 = element("span");
    			t2 = text(t2_value);
    			t3 = space();
    			span2 = element("span");
    			t4 = text(t4_value);
    			t5 = space();
    			button = element("button");
    			button.textContent = "delete";
    			t7 = space();
    			attr_dev(span0, "class", "time");
    			add_location(span0, file$2, 141, 10, 2792);
    			attr_dev(span1, "class", "user svelte-p1ll29");
    			add_location(span1, file$2, 142, 10, 2873);
    			attr_dev(div_1, "class", "meta svelte-p1ll29");
    			add_location(div_1, file$2, 140, 8, 2763);
    			attr_dev(button, "class", "delete svelte-p1ll29");
    			add_location(button, file$2, 146, 10, 2982);
    			attr_dev(span2, "class", "msg svelte-p1ll29");
    			add_location(span2, file$2, 144, 8, 2933);
    			attr_dev(article, "class", "svelte-p1ll29");
    			toggle_class(article, "user", /*val*/ ctx[11].user === /*$user*/ ctx[3]);
    			add_location(article, file$2, 135, 6, 2627);
    			this.first = article;
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, article, anchor);
    			append_dev(article, div_1);
    			append_dev(div_1, span0);
    			append_dev(span0, t0);
    			append_dev(div_1, t1);
    			append_dev(div_1, span1);
    			append_dev(span1, t2);
    			append_dev(article, t3);
    			append_dev(article, span2);
    			append_dev(span2, t4);
    			append_dev(span2, t5);
    			append_dev(span2, button);
    			append_dev(article, t7);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", prevent_default(click_handler), false, true, false);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty & /*$store*/ 4) && t0_value !== (t0_value = new Date(/*val*/ ctx[11].time).toLocaleString("en-US") + "")) set_data_dev(t0, t0_value);
    			if ((!current || dirty & /*$store*/ 4) && t2_value !== (t2_value = /*val*/ ctx[11].user + "")) set_data_dev(t2, t2_value);
    			if ((!current || dirty & /*$store*/ 4) && t4_value !== (t4_value = /*val*/ ctx[11].msg + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*$store, $user*/ 12) {
    				toggle_class(article, "user", /*val*/ ctx[11].user === /*$user*/ ctx[3]);
    			}
    		},
    		r: function measure() {
    			rect = article.getBoundingClientRect();
    		},
    		f: function fix() {
    			fix_position(article);
    			stop_animation();
    			add_transform(article, rect);
    		},
    		a: function animate() {
    			stop_animation();
    			stop_animation = create_animation(article, rect, flip, {});
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (article_outro) article_outro.end(1);
    				if (!article_intro) article_intro = create_in_transition(article, /*receive*/ ctx[4], { key: /*val*/ ctx[11].msgId });
    				article_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (article_intro) article_intro.invalidate();
    			article_outro = create_out_transition(article, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    			if (detaching && article_outro) article_outro.end();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(135:4) {#each $store as val (val.msgId)}",
    		ctx
    	});

    	return block;
    }

    // (168:4) {#if msgInput}
    function create_if_block$1(ctx) {
    	let input;
    	let input_intro;
    	let input_outro;
    	let current;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "class", "submit svelte-p1ll29");
    			attr_dev(input, "type", "submit");
    			input.value = "Send";
    			add_location(input, file$2, 168, 6, 3504);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (input_outro) input_outro.end(1);
    				if (!input_intro) input_intro = create_in_transition(input, fade, {});
    				input_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (input_intro) input_intro.invalidate();
    			input_outro = create_out_transition(input, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			if (detaching && input_outro) input_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(168:4) {#if msgInput}",
    		ctx
    	});

    	return block;
    }

    // (132:0) <Page>
    function create_default_slot(ctx) {
    	let t0;
    	let div_1;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t1;
    	let form;
    	let input;
    	let t2;
    	let current;
    	let dispose;

    	const nav = new Nav({
    			props: {
    				backTo: "settings",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let each_value = /*$store*/ ctx[2];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*val*/ ctx[11].msgId;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	let if_block = /*msgInput*/ ctx[0] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			create_component(nav.$$.fragment);
    			t0 = space();
    			div_1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			form = element("form");
    			input = element("input");
    			t2 = space();
    			if (if_block) if_block.c();
    			attr_dev(div_1, "class", "scrollable svelte-p1ll29");
    			add_location(div_1, file$2, 133, 2, 2542);
    			attr_dev(input, "class", "msg-input svelte-p1ll29");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "name", "msg");
    			add_location(input, file$2, 166, 4, 3406);
    			attr_dev(form, "class", "submit-form svelte-p1ll29");
    			attr_dev(form, "method", "get");
    			add_location(form, file$2, 158, 2, 3212);
    		},
    		m: function mount(target, anchor, remount) {
    			mount_component(nav, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div_1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div_1, null);
    			}

    			/*div_1_binding*/ ctx[8](div_1);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, form, anchor);
    			append_dev(form, input);
    			set_input_value(input, /*msgInput*/ ctx[0]);
    			append_dev(form, t2);
    			if (if_block) if_block.m(form, null);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input, "input", /*input_input_handler*/ ctx[9]),
    				listen_dev(form, "submit", prevent_default(/*submit_handler*/ ctx[10]), false, true, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			const nav_changes = {};

    			if (dirty & /*$$scope*/ 16384) {
    				nav_changes.$$scope = { dirty, ctx };
    			}

    			nav.$set(nav_changes);

    			if (dirty & /*$store, $user, store, Date*/ 12) {
    				const each_value = /*$store*/ ctx[2];
    				validate_each_argument(each_value);
    				group_outros();
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].r();
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div_1, fix_and_outro_and_destroy_block, create_each_block, null, get_each_context);
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].a();
    				check_outros();
    			}

    			if (dirty & /*msgInput*/ 1 && input.value !== /*msgInput*/ ctx[0]) {
    				set_input_value(input, /*msgInput*/ ctx[0]);
    			}

    			if (/*msgInput*/ ctx[0]) {
    				if (!if_block) {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(form, null);
    				} else {
    					transition_in(if_block, 1);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(nav.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(nav.$$.fragment, local);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(nav, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div_1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			/*div_1_binding*/ ctx[8](null);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(form);
    			if (if_block) if_block.d();
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(132:0) <Page>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let current;

    	const page = new Page({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(page.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(page, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const page_changes = {};

    			if (dirty & /*$$scope, msgInput, $store, $user, div*/ 16399) {
    				page_changes.$$scope = { dirty, ctx };
    			}

    			page.$set(page_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(page.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(page.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(page, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $store;
    	let $user;
    	validate_store(store, "store");
    	component_subscribe($$self, store, $$value => $$invalidate(2, $store = $$value));
    	validate_store(user, "user");
    	component_subscribe($$self, user, $$value => $$invalidate(3, $user = $$value));
    	let msgInput;
    	let div;
    	let autoscroll;

    	beforeUpdate(() => {
    		autoscroll = div && div.offsetHeight + div.scrollTop < div.scrollHeight + 50;
    	});

    	afterUpdate(() => {
    		if (autoscroll) div.scrollTo(0, div.scrollHeight - 50);
    	});

    	onMount(() => {
    		if (div) div.scrollTo(0, div.scrollHeight - 50);
    	});

    	const [send, receive] = crossfade({
    		duration: d => Math.sqrt(d * 200),
    		fallback(node, params) {
    			const style = getComputedStyle(node);
    			const transform = style.transform === "none" ? "" : style.transform;

    			return {
    				duration: 600,
    				easing: quintOut,
    				css: t => `
					transform: ${transform} scale(${t});
					opacity: ${t}
				`
    			};
    		}
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Message> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Message", $$slots, []);

    	const click_handler = (val, e) => {
    		store.delete(val.msgId);
    	};

    	function div_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(1, div = $$value);
    		});
    	}

    	function input_input_handler() {
    		msgInput = this.value;
    		$$invalidate(0, msgInput);
    	}

    	const submit_handler = () => {
    		if (!msgInput) return;
    		set_store_value(store, $store = { msg: msgInput, user: $user });
    		$$invalidate(0, msgInput = "");
    	};

    	$$self.$capture_state = () => ({
    		beforeUpdate,
    		afterUpdate,
    		onMount,
    		fade,
    		fly,
    		quintOut,
    		crossfade,
    		flip,
    		user,
    		store,
    		Page,
    		Nav,
    		msgInput,
    		div,
    		autoscroll,
    		send,
    		receive,
    		$store,
    		$user
    	});

    	$$self.$inject_state = $$props => {
    		if ("msgInput" in $$props) $$invalidate(0, msgInput = $$props.msgInput);
    		if ("div" in $$props) $$invalidate(1, div = $$props.div);
    		if ("autoscroll" in $$props) autoscroll = $$props.autoscroll;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		msgInput,
    		div,
    		$store,
    		$user,
    		receive,
    		autoscroll,
    		send,
    		click_handler,
    		div_1_binding,
    		input_input_handler,
    		submit_handler
    	];
    }

    class Message extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Message",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/Settings.svelte generated by Svelte v3.20.1 */
    const file$3 = "src/Settings.svelte";

    // (48:2) <Nav>
    function create_default_slot_1$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Settings");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(48:2) <Nav>",
    		ctx
    	});

    	return block;
    }

    // (62:6) {#if $user}
    function create_if_block$2(ctx) {
    	let input;
    	let input_intro;
    	let input_outro;
    	let current;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "class", "submit svelte-10t36s6");
    			attr_dev(input, "type", "submit");
    			input.value = "Send";
    			add_location(input, file$3, 62, 8, 1218);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (input_outro) input_outro.end(1);
    				if (!input_intro) input_intro = create_in_transition(input, fade, {});
    				input_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (input_intro) input_intro.invalidate();
    			input_outro = create_out_transition(input, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			if (detaching && input_outro) input_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(62:6) {#if $user}",
    		ctx
    	});

    	return block;
    }

    // (47:0) <Page>
    function create_default_slot$1(ctx) {
    	let t0;
    	let form;
    	let label;
    	let t2;
    	let div;
    	let input;
    	let t3;
    	let current;
    	let dispose;

    	const nav_1 = new Nav({
    			props: {
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let if_block = /*$user*/ ctx[0] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			create_component(nav_1.$$.fragment);
    			t0 = space();
    			form = element("form");
    			label = element("label");
    			label.textContent = "ENTER YOUR NICKNAME";
    			t2 = space();
    			div = element("div");
    			input = element("input");
    			t3 = space();
    			if (if_block) if_block.c();
    			attr_dev(label, "id", "name-label");
    			attr_dev(label, "class", "svelte-10t36s6");
    			add_location(label, file$3, 53, 4, 952);
    			attr_dev(input, "placeholder", "Steve Jobs");
    			attr_dev(input, "aria-labelledby", "name-label");
    			attr_dev(input, "name", "user");
    			attr_dev(input, "class", "user-input svelte-10t36s6");
    			add_location(input, file$3, 55, 6, 1038);
    			attr_dev(div, "class", "user-input svelte-10t36s6");
    			add_location(div, file$3, 54, 4, 1007);
    			attr_dev(form, "class", "svelte-10t36s6");
    			add_location(form, file$3, 48, 2, 846);
    		},
    		m: function mount(target, anchor, remount) {
    			mount_component(nav_1, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, form, anchor);
    			append_dev(form, label);
    			append_dev(form, t2);
    			append_dev(form, div);
    			append_dev(div, input);
    			set_input_value(input, /*$user*/ ctx[0]);
    			append_dev(div, t3);
    			if (if_block) if_block.m(div, null);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input, "input", /*input_input_handler*/ ctx[2]),
    				listen_dev(form, "submit", prevent_default(/*submit_handler*/ ctx[3]), false, true, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			const nav_1_changes = {};

    			if (dirty & /*$$scope*/ 16) {
    				nav_1_changes.$$scope = { dirty, ctx };
    			}

    			nav_1.$set(nav_1_changes);

    			if (dirty & /*$user*/ 1 && input.value !== /*$user*/ ctx[0]) {
    				set_input_value(input, /*$user*/ ctx[0]);
    			}

    			if (/*$user*/ ctx[0]) {
    				if (!if_block) {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				} else {
    					transition_in(if_block, 1);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(nav_1.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(nav_1.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(nav_1, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(form);
    			if (if_block) if_block.d();
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(47:0) <Page>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let current;

    	const page = new Page({
    			props: {
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(page.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(page, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const page_changes = {};

    			if (dirty & /*$$scope, $user, $nav*/ 19) {
    				page_changes.$$scope = { dirty, ctx };
    			}

    			page.$set(page_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(page.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(page.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(page, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $user;
    	let $nav;
    	validate_store(user, "user");
    	component_subscribe($$self, user, $$value => $$invalidate(0, $user = $$value));
    	validate_store(nav, "nav");
    	component_subscribe($$self, nav, $$value => $$invalidate(1, $nav = $$value));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Settings> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Settings", $$slots, []);

    	function input_input_handler() {
    		$user = this.value;
    		user.set($user);
    	}

    	const submit_handler = e => {
    		if (!$user) return;
    		set_store_value(nav, $nav = "messages");
    	};

    	$$self.$capture_state = () => ({
    		user,
    		fade,
    		fly,
    		nav,
    		flip,
    		Page,
    		Nav,
    		$user,
    		$nav
    	});

    	return [$user, $nav, input_input_handler, submit_handler];
    }

    class Settings extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Settings",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.20.1 */

    // (15:30) 
    function create_if_block_1(ctx) {
    	let current;
    	const messages = new Message({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(messages.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(messages, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(messages.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(messages.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(messages, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(15:30) ",
    		ctx
    	});

    	return block;
    }

    // (13:0) {#if $nav === 'settings'}
    function create_if_block$3(ctx) {
    	let current;
    	const settings = new Settings({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(settings.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(settings, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(settings.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(settings.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(settings, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(13:0) {#if $nav === 'settings'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$3, create_if_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$nav*/ ctx[0] === "settings") return 0;
    		if (/*$nav*/ ctx[0] === "messages") return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty$1();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $user;
    	let $nav;
    	validate_store(user, "user");
    	component_subscribe($$self, user, $$value => $$invalidate(1, $user = $$value));
    	validate_store(nav, "nav");
    	component_subscribe($$self, nav, $$value => $$invalidate(0, $nav = $$value));

    	if (!$user) {
    		set_store_value(nav, $nav = "settings");
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	$$self.$capture_state = () => ({
    		user,
    		nav,
    		Messages: Message,
    		Settings,
    		Nav,
    		$user,
    		$nav
    	});

    	return [$nav];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    const app = new App({
      target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
