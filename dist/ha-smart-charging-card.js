/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const W = globalThis, te = W.ShadowRoot && (W.ShadyCSS === void 0 || W.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, ie = Symbol(), de = /* @__PURE__ */ new WeakMap();
let Se = class {
  constructor(e, t, i) {
    if (this._$cssResult$ = !0, i !== ie) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = t;
  }
  get styleSheet() {
    let e = this.o;
    const t = this.t;
    if (te && e === void 0) {
      const i = t !== void 0 && t.length === 1;
      i && (e = de.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), i && de.set(t, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const Ke = (r) => new Se(typeof r == "string" ? r : r + "", void 0, ie), H = (r, ...e) => {
  const t = r.length === 1 ? r[0] : e.reduce((i, s, o) => i + ((a) => {
    if (a._$cssResult$ === !0) return a.cssText;
    if (typeof a == "number") return a;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + a + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s) + r[o + 1], r[0]);
  return new Se(t, r, ie);
}, Ze = (r, e) => {
  if (te) r.adoptedStyleSheets = e.map((t) => t instanceof CSSStyleSheet ? t : t.styleSheet);
  else for (const t of e) {
    const i = document.createElement("style"), s = W.litNonce;
    s !== void 0 && i.setAttribute("nonce", s), i.textContent = t.cssText, r.appendChild(i);
  }
}, ue = te ? (r) => r : (r) => r instanceof CSSStyleSheet ? ((e) => {
  let t = "";
  for (const i of e.cssRules) t += i.cssText;
  return Ke(t);
})(r) : r;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Je, defineProperty: Qe, getOwnPropertyDescriptor: Ye, getOwnPropertyNames: Xe, getOwnPropertySymbols: et, getPrototypeOf: tt } = Object, V = globalThis, pe = V.trustedTypes, it = pe ? pe.emptyScript : "", st = V.reactiveElementPolyfillSupport, R = (r, e) => r, B = { toAttribute(r, e) {
  switch (e) {
    case Boolean:
      r = r ? it : null;
      break;
    case Object:
    case Array:
      r = r == null ? r : JSON.stringify(r);
  }
  return r;
}, fromAttribute(r, e) {
  let t = r;
  switch (e) {
    case Boolean:
      t = r !== null;
      break;
    case Number:
      t = r === null ? null : Number(r);
      break;
    case Object:
    case Array:
      try {
        t = JSON.parse(r);
      } catch {
        t = null;
      }
  }
  return t;
} }, se = (r, e) => !Je(r, e), fe = { attribute: !0, type: String, converter: B, reflect: !1, useDefault: !1, hasChanged: se };
Symbol.metadata ??= Symbol("metadata"), V.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let P = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ??= []).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, t = fe) {
    if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
      const i = Symbol(), s = this.getPropertyDescriptor(e, i, t);
      s !== void 0 && Qe(this.prototype, e, s);
    }
  }
  static getPropertyDescriptor(e, t, i) {
    const { get: s, set: o } = Ye(this.prototype, e) ?? { get() {
      return this[t];
    }, set(a) {
      this[t] = a;
    } };
    return { get: s, set(a) {
      const c = s?.call(this);
      o?.call(this, a), this.requestUpdate(e, c, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? fe;
  }
  static _$Ei() {
    if (this.hasOwnProperty(R("elementProperties"))) return;
    const e = tt(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(R("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(R("properties"))) {
      const t = this.properties, i = [...Xe(t), ...et(t)];
      for (const s of i) this.createProperty(s, t[s]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const t = litPropertyMetadata.get(e);
      if (t !== void 0) for (const [i, s] of t) this.elementProperties.set(i, s);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t, i] of this.elementProperties) {
      const s = this._$Eu(t, i);
      s !== void 0 && this._$Eh.set(s, t);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const t = [];
    if (Array.isArray(e)) {
      const i = new Set(e.flat(1 / 0).reverse());
      for (const s of i) t.unshift(ue(s));
    } else e !== void 0 && t.push(ue(e));
    return t;
  }
  static _$Eu(e, t) {
    const i = t.attribute;
    return i === !1 ? void 0 : typeof i == "string" ? i : typeof e == "string" ? e.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((e) => e(this));
  }
  addController(e) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(e), this.renderRoot !== void 0 && this.isConnected && e.hostConnected?.();
  }
  removeController(e) {
    this._$EO?.delete(e);
  }
  _$E_() {
    const e = /* @__PURE__ */ new Map(), t = this.constructor.elementProperties;
    for (const i of t.keys()) this.hasOwnProperty(i) && (e.set(i, this[i]), delete this[i]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return Ze(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((e) => e.hostDisconnected?.());
  }
  attributeChangedCallback(e, t, i) {
    this._$AK(e, i);
  }
  _$ET(e, t) {
    const i = this.constructor.elementProperties.get(e), s = this.constructor._$Eu(e, i);
    if (s !== void 0 && i.reflect === !0) {
      const o = (i.converter?.toAttribute !== void 0 ? i.converter : B).toAttribute(t, i.type);
      this._$Em = e, o == null ? this.removeAttribute(s) : this.setAttribute(s, o), this._$Em = null;
    }
  }
  _$AK(e, t) {
    const i = this.constructor, s = i._$Eh.get(e);
    if (s !== void 0 && this._$Em !== s) {
      const o = i.getPropertyOptions(s), a = typeof o.converter == "function" ? { fromAttribute: o.converter } : o.converter?.fromAttribute !== void 0 ? o.converter : B;
      this._$Em = s;
      const c = a.fromAttribute(t, o.type);
      this[s] = c ?? this._$Ej?.get(s) ?? c, this._$Em = null;
    }
  }
  requestUpdate(e, t, i, s = !1, o) {
    if (e !== void 0) {
      const a = this.constructor;
      if (s === !1 && (o = this[e]), i ??= a.getPropertyOptions(e), !((i.hasChanged ?? se)(o, t) || i.useDefault && i.reflect && o === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, i)))) return;
      this.C(e, t, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, t, { useDefault: i, reflect: s, wrapped: o }, a) {
    i && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, a ?? t ?? this[e]), o !== !0 || a !== void 0) || (this._$AL.has(e) || (this.hasUpdated || i || (t = void 0), this._$AL.set(e, t)), s === !0 && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (t) {
      Promise.reject(t);
    }
    const e = this.scheduleUpdate();
    return e != null && await e, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [s, o] of this._$Ep) this[s] = o;
        this._$Ep = void 0;
      }
      const i = this.constructor.elementProperties;
      if (i.size > 0) for (const [s, o] of i) {
        const { wrapped: a } = o, c = this[s];
        a !== !0 || this._$AL.has(s) || c === void 0 || this.C(s, void 0, o, c);
      }
    }
    let e = !1;
    const t = this._$AL;
    try {
      e = this.shouldUpdate(t), e ? (this.willUpdate(t), this._$EO?.forEach((i) => i.hostUpdate?.()), this.update(t)) : this._$EM();
    } catch (i) {
      throw e = !1, this._$EM(), i;
    }
    e && this._$AE(t);
  }
  willUpdate(e) {
  }
  _$AE(e) {
    this._$EO?.forEach((t) => t.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(e) {
    return !0;
  }
  update(e) {
    this._$Eq &&= this._$Eq.forEach((t) => this._$ET(t, this[t])), this._$EM();
  }
  updated(e) {
  }
  firstUpdated(e) {
  }
};
P.elementStyles = [], P.shadowRootOptions = { mode: "open" }, P[R("elementProperties")] = /* @__PURE__ */ new Map(), P[R("finalized")] = /* @__PURE__ */ new Map(), st?.({ ReactiveElement: P }), (V.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const re = globalThis, ge = (r) => r, q = re.trustedTypes, me = q ? q.createPolicy("lit-html", { createHTML: (r) => r }) : void 0, Pe = "$lit$", x = `lit$${Math.random().toFixed(9).slice(2)}$`, Te = "?" + x, rt = `<${Te}>`, S = document, M = () => S.createComment(""), N = (r) => r === null || typeof r != "object" && typeof r != "function", oe = Array.isArray, ot = (r) => oe(r) || typeof r?.[Symbol.iterator] == "function", Q = `[ 	
\f\r]`, I = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, ve = /-->/g, be = />/g, A = RegExp(`>|${Q}(?:([^\\s"'>=/]+)(${Q}*=${Q}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), _e = /'/g, ye = /"/g, Oe = /^(?:script|style|textarea|title)$/i, at = (r) => (e, ...t) => ({ _$litType$: r, strings: e, values: t }), p = at(1), T = Symbol.for("lit-noChange"), h = Symbol.for("lit-nothing"), $e = /* @__PURE__ */ new WeakMap(), k = S.createTreeWalker(S, 129);
function Ie(r, e) {
  if (!oe(r) || !r.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return me !== void 0 ? me.createHTML(e) : e;
}
const nt = (r, e) => {
  const t = r.length - 1, i = [];
  let s, o = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", a = I;
  for (let c = 0; c < t; c++) {
    const n = r[c];
    let u, f, l = -1, d = 0;
    for (; d < n.length && (a.lastIndex = d, f = a.exec(n), f !== null); ) d = a.lastIndex, a === I ? f[1] === "!--" ? a = ve : f[1] !== void 0 ? a = be : f[2] !== void 0 ? (Oe.test(f[2]) && (s = RegExp("</" + f[2], "g")), a = A) : f[3] !== void 0 && (a = A) : a === A ? f[0] === ">" ? (a = s ?? I, l = -1) : f[1] === void 0 ? l = -2 : (l = a.lastIndex - f[2].length, u = f[1], a = f[3] === void 0 ? A : f[3] === '"' ? ye : _e) : a === ye || a === _e ? a = A : a === ve || a === be ? a = I : (a = A, s = void 0);
    const g = a === A && r[c + 1].startsWith("/>") ? " " : "";
    o += a === I ? n + rt : l >= 0 ? (i.push(u), n.slice(0, l) + Pe + n.slice(l) + x + g) : n + x + (l === -2 ? c : g);
  }
  return [Ie(r, o + (r[t] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), i];
};
class z {
  constructor({ strings: e, _$litType$: t }, i) {
    let s;
    this.parts = [];
    let o = 0, a = 0;
    const c = e.length - 1, n = this.parts, [u, f] = nt(e, t);
    if (this.el = z.createElement(u, i), k.currentNode = this.el.content, t === 2 || t === 3) {
      const l = this.el.content.firstChild;
      l.replaceWith(...l.childNodes);
    }
    for (; (s = k.nextNode()) !== null && n.length < c; ) {
      if (s.nodeType === 1) {
        if (s.hasAttributes()) for (const l of s.getAttributeNames()) if (l.endsWith(Pe)) {
          const d = f[a++], g = s.getAttribute(l).split(x), y = /([.?@])?(.*)/.exec(d);
          n.push({ type: 1, index: o, name: y[2], strings: g, ctor: y[1] === "." ? lt : y[1] === "?" ? ht : y[1] === "@" ? dt : G }), s.removeAttribute(l);
        } else l.startsWith(x) && (n.push({ type: 6, index: o }), s.removeAttribute(l));
        if (Oe.test(s.tagName)) {
          const l = s.textContent.split(x), d = l.length - 1;
          if (d > 0) {
            s.textContent = q ? q.emptyScript : "";
            for (let g = 0; g < d; g++) s.append(l[g], M()), k.nextNode(), n.push({ type: 2, index: ++o });
            s.append(l[d], M());
          }
        }
      } else if (s.nodeType === 8) if (s.data === Te) n.push({ type: 2, index: o });
      else {
        let l = -1;
        for (; (l = s.data.indexOf(x, l + 1)) !== -1; ) n.push({ type: 7, index: o }), l += x.length - 1;
      }
      o++;
    }
  }
  static createElement(e, t) {
    const i = S.createElement("template");
    return i.innerHTML = e, i;
  }
}
function O(r, e, t = r, i) {
  if (e === T) return e;
  let s = i !== void 0 ? t._$Co?.[i] : t._$Cl;
  const o = N(e) ? void 0 : e._$litDirective$;
  return s?.constructor !== o && (s?._$AO?.(!1), o === void 0 ? s = void 0 : (s = new o(r), s._$AT(r, t, i)), i !== void 0 ? (t._$Co ??= [])[i] = s : t._$Cl = s), s !== void 0 && (e = O(r, s._$AS(r, e.values), s, i)), e;
}
class ct {
  constructor(e, t) {
    this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = t;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(e) {
    const { el: { content: t }, parts: i } = this._$AD, s = (e?.creationScope ?? S).importNode(t, !0);
    k.currentNode = s;
    let o = k.nextNode(), a = 0, c = 0, n = i[0];
    for (; n !== void 0; ) {
      if (a === n.index) {
        let u;
        n.type === 2 ? u = new U(o, o.nextSibling, this, e) : n.type === 1 ? u = new n.ctor(o, n.name, n.strings, this, e) : n.type === 6 && (u = new ut(o, this, e)), this._$AV.push(u), n = i[++c];
      }
      a !== n?.index && (o = k.nextNode(), a++);
    }
    return k.currentNode = S, s;
  }
  p(e) {
    let t = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(e, i, t), t += i.strings.length - 2) : i._$AI(e[t])), t++;
  }
}
class U {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(e, t, i, s) {
    this.type = 2, this._$AH = h, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = i, this.options = s, this._$Cv = s?.isConnected ?? !0;
  }
  get parentNode() {
    let e = this._$AA.parentNode;
    const t = this._$AM;
    return t !== void 0 && e?.nodeType === 11 && (e = t.parentNode), e;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(e, t = this) {
    e = O(this, e, t), N(e) ? e === h || e == null || e === "" ? (this._$AH !== h && this._$AR(), this._$AH = h) : e !== this._$AH && e !== T && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : ot(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== h && N(this._$AH) ? this._$AA.nextSibling.data = e : this.T(S.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: t, _$litType$: i } = e, s = typeof i == "number" ? this._$AC(e) : (i.el === void 0 && (i.el = z.createElement(Ie(i.h, i.h[0]), this.options)), i);
    if (this._$AH?._$AD === s) this._$AH.p(t);
    else {
      const o = new ct(s, this), a = o.u(this.options);
      o.p(t), this.T(a), this._$AH = o;
    }
  }
  _$AC(e) {
    let t = $e.get(e.strings);
    return t === void 0 && $e.set(e.strings, t = new z(e)), t;
  }
  k(e) {
    oe(this._$AH) || (this._$AH = [], this._$AR());
    const t = this._$AH;
    let i, s = 0;
    for (const o of e) s === t.length ? t.push(i = new U(this.O(M()), this.O(M()), this, this.options)) : i = t[s], i._$AI(o), s++;
    s < t.length && (this._$AR(i && i._$AB.nextSibling, s), t.length = s);
  }
  _$AR(e = this._$AA.nextSibling, t) {
    for (this._$AP?.(!1, !0, t); e !== this._$AB; ) {
      const i = ge(e).nextSibling;
      ge(e).remove(), e = i;
    }
  }
  setConnected(e) {
    this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
  }
}
class G {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, t, i, s, o) {
    this.type = 1, this._$AH = h, this._$AN = void 0, this.element = e, this.name = t, this._$AM = s, this.options = o, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = h;
  }
  _$AI(e, t = this, i, s) {
    const o = this.strings;
    let a = !1;
    if (o === void 0) e = O(this, e, t, 0), a = !N(e) || e !== this._$AH && e !== T, a && (this._$AH = e);
    else {
      const c = e;
      let n, u;
      for (e = o[0], n = 0; n < o.length - 1; n++) u = O(this, c[i + n], t, n), u === T && (u = this._$AH[n]), a ||= !N(u) || u !== this._$AH[n], u === h ? e = h : e !== h && (e += (u ?? "") + o[n + 1]), this._$AH[n] = u;
    }
    a && !s && this.j(e);
  }
  j(e) {
    e === h ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class lt extends G {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === h ? void 0 : e;
  }
}
class ht extends G {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== h);
  }
}
class dt extends G {
  constructor(e, t, i, s, o) {
    super(e, t, i, s, o), this.type = 5;
  }
  _$AI(e, t = this) {
    if ((e = O(this, e, t, 0) ?? h) === T) return;
    const i = this._$AH, s = e === h && i !== h || e.capture !== i.capture || e.once !== i.once || e.passive !== i.passive, o = e !== h && (i === h || s);
    s && this.element.removeEventListener(this.name, this, i), o && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class ut {
  constructor(e, t, i) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    O(this, e);
  }
}
const pt = re.litHtmlPolyfillSupport;
pt?.(z, U), (re.litHtmlVersions ??= []).push("3.3.3");
const ft = (r, e, t) => {
  const i = t?.renderBefore ?? e;
  let s = i._$litPart$;
  if (s === void 0) {
    const o = t?.renderBefore ?? null;
    i._$litPart$ = s = new U(e.insertBefore(M(), o), o, void 0, t ?? {});
  }
  return s._$AI(r), s;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ae = globalThis;
class C extends P {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const e = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= e.firstChild, e;
  }
  update(e) {
    const t = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = ft(t, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return T;
  }
}
C._$litElement$ = !0, C.finalized = !0, ae.litElementHydrateSupport?.({ LitElement: C });
const gt = ae.litElementPolyfillSupport;
gt?.({ LitElement: C });
(ae.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const mt = { attribute: !0, type: String, converter: B, reflect: !1, hasChanged: se }, vt = (r = mt, e, t) => {
  const { kind: i, metadata: s } = t;
  let o = globalThis.litPropertyMetadata.get(s);
  if (o === void 0 && globalThis.litPropertyMetadata.set(s, o = /* @__PURE__ */ new Map()), i === "setter" && ((r = Object.create(r)).wrapped = !0), o.set(t.name, r), i === "accessor") {
    const { name: a } = t;
    return { set(c) {
      const n = e.get.call(this);
      e.set.call(this, c), this.requestUpdate(a, n, r, !0, c);
    }, init(c) {
      return c !== void 0 && this.C(a, void 0, r, c), c;
    } };
  }
  if (i === "setter") {
    const { name: a } = t;
    return function(c) {
      const n = this[a];
      e.call(this, c), this.requestUpdate(a, n, r, !0, c);
    };
  }
  throw Error("Unsupported decorator location: " + i);
};
function L(r) {
  return (e, t) => typeof t == "object" ? vt(r, e, t) : ((i, s, o) => {
    const a = s.hasOwnProperty(o);
    return s.constructor.createProperty(o, i), a ? Object.getOwnPropertyDescriptor(s, o) : void 0;
  })(r, e, t);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function D(r) {
  return L({ ...r, state: !0, attribute: !1 });
}
const Re = H`
  :host {
    --tile-color: var(--state-inactive-color, #7b7b7b);
    display: block;
  }

  /*
   * A card takes the height it is given when a height was actually given: rows
   * set by hand rather than left on auto, and something under the line to fill
   * them with. A block host with an automatic height ignores that height
   * outright — a card told to be four rows tall drew 130px inside a 248px slot
   * and left the rest as a hole — and inheriting it is what finally gives
   * ha-card's own height: 100% something to resolve against.
   *
   * On auto the card keeps its natural height even when a taller neighbour
   * makes the grid row taller, exactly as the stock tile does. Filling there
   * looked worse, not better: three rows of heating spread over 350px because
   * the card beside it had a lot to say.
   */
  :host([filled]) {
    height: 100%;
  }

  ha-card {
    height: 100%;
    transition:
      box-shadow 180ms ease-in-out,
      border-color 180ms ease-in-out;
  }

  ha-card:has(ha-tile-container[focused]) {
    --shadow-default: var(--ha-card-box-shadow, 0 0 0 0 transparent);
    --shadow-focus: 0 0 0 1px var(--tile-color);
    border-color: var(--tile-color);
    box-shadow: var(--shadow-default), var(--shadow-focus);
  }

  ha-tile-icon {
    --tile-icon-color: var(--tile-color);
  }

  hui-card-features {
    --feature-color: var(--tile-color);
  }

  /*
   * Where the spare height goes.
   *
   * ha-tile-container gives its top row flex: 1, so on a card with a fixed
   * height every extra pixel lands in the icon-and-text row — the stock tile at
   * four rows is 248px of a single line. That row is the card's identity and
   * belongs at exactly one layout row; the room underneath is what the rest of
   * the content is for. The row lives in HA's shadow and cannot be restyled
   * from out here, so it is outvoted instead: our half of the card asks for the
   * free space with a growth factor two orders of magnitude larger and the row
   * keeps its 56px minimum plus a rounding error.
   */
  .custom-features,
  hui-card-features[slot="features"] {
    flex: 100 1 auto;
    min-height: 0;
  }


  /* The texts and the right-hand column share one row of the info slot. */
  .info {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
    min-width: 0;
    gap: 6px;
  }

  .info ha-tile-info {
    flex: 1;
    min-width: 0;
  }

  .info.vertical {
    flex-direction: column;
    gap: 0;
  }

  /*
   * The one departure from the tile canon: the main values are moved into the
   * right-hand column in a large font. Each next value drops the font a step,
   * otherwise the column eats the card name.
   */
  .values {
    flex: none;
    display: flex;
    align-items: baseline;
    gap: 4px;
    white-space: nowrap;
    color: var(--primary-text-color);
    font-size: var(--ha-font-size-xl, 20px);
    line-height: var(--ha-line-height-condensed, 1.2);
  }

  .values.of-2 {
    font-size: var(--ha-font-size-l, 16px);
  }

  .values.of-3 {
    font-size: var(--ha-font-size-m, 14px);
    gap: 2px;
  }

  /* The icon names the quantity; the number stays the star, the icon is muted. */
  .values .clickable,
  .values > span,
  .values > button {
    display: inline-flex;
    align-items: center;
    gap: 3px;
  }

  .value-icon {
    flex: none;
    color: var(--secondary-text-color);
    --mdc-icon-size: 17px;
  }

  .values.of-2 .value-icon {
    --mdc-icon-size: 15px;
  }

  .values.of-3 .value-icon {
    --mdc-icon-size: 14px;
  }

  .values-separator {
    color: var(--secondary-text-color);
  }

  .unit {
    font-size: var(--ha-font-size-s, 12px);
    color: var(--secondary-text-color);
  }

  /*
   * The second departure: values are clickable one by one, and a tap on each
   * opens more-info for its entity. Tile content does not take events, so the
   * tap targets switch them back on.
   */
  .clickable {
    padding: 0;
    border: none;
    background: none;
    font: inherit;
    color: inherit;
    letter-spacing: inherit;
    cursor: pointer;
    pointer-events: auto;
  }
  .clickable:hover {
    opacity: 0.7;
  }
  .clickable:focus-visible {
    outline: 2px solid var(--tile-color);
    outline-offset: 2px;
    border-radius: var(--ha-border-radius-sm, 6px);
  }

  /* Our own features line: the same padding as the stock row. */
  .custom-features {
    display: flex;
    flex-direction: column;
    padding: 0 var(--ha-space-3, 12px) var(--ha-space-3, 12px);
    pointer-events: auto;
  }

  /* Whatever is inside takes the whole line: rows spread, controls space out. */
  .custom-features > * {
    flex: 1;
    min-height: 0;
  }

  .warning {
    display: block;
    padding: var(--ha-space-3, 12px);
    color: var(--warning-color, #ffa600);
    font-size: var(--ha-font-size-m, 14px);
  }
`, bt = /* @__PURE__ */ new Set(["unavailable", "unknown"]), _t = /* @__PURE__ */ new Set([
  "aqi",
  "battery",
  "carbon_dioxide",
  "carbon_monoxide",
  "humidity",
  "illuminance",
  "moisture",
  "nitrogen_dioxide",
  "nitrogen_monoxide",
  "nitrous_oxide",
  "ozone",
  "pm1",
  "pm10",
  "pm25",
  "sulphur_dioxide",
  "volatile_organic_compounds",
  "volatile_organic_compounds_parts"
]);
function yt(r) {
  const e = r?.attributes.device_class;
  if (!e || !_t.has(e)) return !1;
  const t = Number(r.state);
  return Number.isFinite(t) && t < 0;
}
const $t = " · ";
function wt(r, e) {
  if (!(!r || !e || !e.stateObj || e.missing || e.unavailable) && !e.impossible)
    return r.formatEntityState(e.stateObj);
}
function xt(r) {
  return r.filter(
    (e) => !!e && (e.content !== void 0 || (e.text ?? "").trim() !== "")
  );
}
function At(r, e) {
  const t = wt(r, e);
  return t ? { text: t, entityId: e?.entityId } : void 0;
}
function Et(r, e) {
  if (!e) return { value: r };
  if (!r.endsWith(e)) return { value: r };
  const t = r.slice(0, r.length - e.length).trimEnd();
  return t ? { value: t, unit: e } : { value: r };
}
const we = "unavailable", kt = "unknown", Ct = "off", St = /* @__PURE__ */ new Set(["button", "input_button", "scene"]), Me = (r) => r.substring(0, r.indexOf("."));
function Pt(r, e) {
  const t = Me(r.entity_id), i = r.state;
  if (St.has(t))
    return i !== we;
  if (i === we || i === kt || i === Ct && t !== "alert")
    return !1;
  switch (t) {
    case "alarm_control_panel":
      return i !== "disarmed";
    case "alert":
      return i !== "idle";
    case "cover":
    case "valve":
      return i !== "closed";
    case "device_tracker":
    case "person":
      return i !== "not_home";
    case "lawn_mower":
      return !["docked", "paused"].includes(i);
    case "lock":
      return i !== "locked";
    case "media_player":
      return i !== "standby";
    case "vacuum":
      return !["idle", "docked", "paused"].includes(i);
    case "plant":
      return i === "problem";
    case "group":
      return ["on", "home", "open", "locked", "problem"].includes(i);
    case "timer":
      return i === "active";
    case "camera":
      return ["streaming", "recording"].includes(i);
    default:
      return !0;
  }
}
function E(r) {
  return r !== void 0 && r.action !== "none";
}
const Tt = ["closed", "locked", "off"], Ot = {
  button: { on: "press" },
  camera: { on: "turn_on", off: "turn_off" },
  climate: { on: "turn_on", off: "turn_off" },
  cover: { on: "open_cover", off: "close_cover" },
  input_button: { on: "press" },
  lock: { on: "unlock", off: "lock" },
  media_player: { on: "turn_on", off: "turn_off" },
  scene: { on: "turn_on" },
  siren: { on: "turn_on", off: "turn_off" },
  valve: { on: "open_valve", off: "close_valve" }
};
function It(r, e) {
  const t = Ot[r];
  return t ? (e ? t.on : t.off) ?? t.on : e ? "turn_on" : "turn_off";
}
function Rt(r, e) {
  const t = r.states[e];
  if (!t) return;
  const i = Me(e), s = i === "group" ? "homeassistant" : i, o = Tt.includes(t.state);
  r.callService(s, It(i, o), {
    entity_id: e
  });
}
function xe(r, e, t) {
  r.dispatchEvent(
    new CustomEvent(e, { detail: t, bubbles: !0, composed: !0 })
  );
}
function Mt(r, e) {
  e ? window.history.replaceState(null, "", r) : window.history.pushState(null, "", r), window.dispatchEvent(new CustomEvent("location-changed", { detail: {} }));
}
async function Nt(r, e) {
  if (!e.confirmation) return !0;
  const t = window.loadCardHelpers;
  if (!t) return window.confirm(e.confirmation.text ?? "Are you sure?");
  const i = await t();
  return i.showConfirmationDialog ? i.showConfirmationDialog(r, {
    text: e.confirmation.text,
    title: e.confirmation.title,
    confirmText: e.confirmation.confirm_text,
    dismissText: e.confirmation.dismiss_text
  }) : window.confirm(e.confirmation.text ?? "Are you sure?");
}
async function zt(r, e, t, i) {
  let s;
  if (i === "double_tap" ? s = t.double_tap_action : i === "hold" ? s = t.hold_action : s = t.tap_action, s || (s = { action: "more-info" }), !!await Nt(r, s))
    switch (s.action) {
      case "none":
        break;
      case "more-info": {
        const o = s.entity || t.entity;
        o && xe(r, "hass-more-info", { entityId: o });
        break;
      }
      case "toggle": {
        const o = s.entity || t.entity;
        o && Rt(e, o);
        break;
      }
      case "navigate":
        s.navigation_path && Mt(s.navigation_path, s.navigation_replace);
        break;
      case "url":
        s.url_path && window.open(s.url_path, "_blank", "noreferrer");
        break;
      case "perform-action":
      case "call-service": {
        const o = s.perform_action || s.service;
        if (!o) break;
        const [a, c] = o.split(".", 2);
        e.callService(a, c, {
          ...s.data ?? s.service_data ?? {},
          ...s.target ?? {}
        });
        break;
      }
      case "fire-dom-event":
        xe(r, "ll-custom", s);
        break;
      default:
        console.warn(
          `horos-cards: action "${s.action}" is not supported`
        );
    }
}
const Ht = 2;
function Ae(r, e) {
  const t = r ?? [];
  if (e !== "inline")
    return { inline: [], below: t, columns: 1 };
  const i = t.slice(1);
  return {
    inline: t.slice(0, 1),
    below: i,
    columns: Math.min(i.length, Ht)
  };
}
function Ut(r) {
  return Math.ceil(r.below.length / Math.max(r.columns, 1));
}
const Ne = 5e3, Ee = [
  "ha-tile-container",
  "ha-tile-icon",
  "ha-tile-info",
  "hui-card-features"
];
let j, F;
function ze(r, e) {
  return customElements.get(r) ? Promise.resolve(!0) : Promise.race([
    customElements.whenDefined(r).then(() => !0),
    new Promise((t) => setTimeout(() => t(!1), e))
  ]);
}
async function Lt() {
  const r = window.loadCardHelpers;
  if (r)
    try {
      (await r()).createCardElement?.({ type: "tile", entity: "sun.sun" });
    } catch {
    }
}
function He() {
  return j || (j = (async () => Ee.every((e) => customElements.get(e)) ? !0 : (await Lt(), (await Promise.all(
    Ee.map((e) => ze(e, Ne))
  )).every(Boolean)))(), j);
}
function Dt() {
  return F || (F = (async () => {
    if (customElements.get("hui-card-features-editor")) return !0;
    await He();
    const r = customElements.get("hui-tile-card");
    try {
      await r?.getConfigElement?.();
    } catch {
    }
    return ze("hui-card-features-editor", Ne);
  })(), F);
}
const jt = {
  temperature: "mdi:thermometer",
  humidity: "mdi:water-percent",
  moisture: "mdi:water-percent",
  illuminance: "mdi:brightness-5",
  pm25: "mdi:blur",
  power: "mdi:flash",
  energy: "mdi:counter",
  battery: "mdi:battery",
  disk: "mdi:harddisk",
  cpu: "mdi:cpu-64-bit",
  memory: "mdi:memory",
  gpu: "mdi:expansion-card",
  download: "mdi:download",
  upload: "mdi:upload",
  total: "mdi:flash",
  brightness: "mdi:brightness-6",
  volume: "mdi:volume-high",
  tasks: "mdi:check-circle-outline",
  updates: "mdi:package-up"
}, Ft = {
  "entity.missing.one": "Entity not found: {list}",
  "entity.missing.many": "Entities not found: {list}",
  "internals.failed": "Could not load Home Assistant components",
  "value.unknown": "no data",
  "charger.title": "Smart Charger",
  "charger.idle": "Idle",
  "charger.charging": "Charging",
  "charger.cooldown": "Cooldown",
  "charger.sleep": "Sleep",
  "charger.manual_100": "Manual 100%",
  "charger.generic": "Generic device",
  "charger.force_100": "Force 100%",
  "charger.stop": "Stop",
  "charger.probing": "Probing cable...",
  "charger.connected": "Connected",
  "charger.limit": "Limit {min}% – {max}%",
  "charger.noChargers": "No chargers configured"
};
function Ue(r) {
  return "en";
}
function Wt(r, e) {
  return e === 1 ? "one" : "many";
}
function _(r, e, t = {}) {
  const i = Ue(), s = Ft, o = t.count, a = typeof o == "number" ? `${e}.${Wt(i, o)}` : void 0;
  return ((a && s[a]) ?? s[e] ?? e).replace(
    /\{(\w+)\}/g,
    (n, u) => u in t ? String(t[u]) : n
  );
}
var Bt = Object.defineProperty, ne = (r, e, t, i) => {
  for (var s = void 0, o = r.length - 1, a; o >= 0; o--)
    (a = r[o]) && (s = a(e, t, s) || s);
  return s && Bt(e, t, s), s;
};
class K extends C {
  constructor() {
    super(...arguments), this._ready = !1, this.base = {};
  }
  static {
    this.styles = [Re];
  }
  /**
   * How much room the content below the line takes, in layout rows: level rows,
   * features, controls of our own. A subclass overrides this if it has any.
   */
  contentRows() {
    return this.fixedRows();
  }
  /**
   * Layout rows for a list of level rows: three of them fit in one, and none of
   * them are there at all when the card's own line is switched off.
   *
   * Three, not two, because that is what a level row actually measures. A
   * layout row gives the content under the line 64px (56 of row plus the 8 of
   * gap it swallows); a row is a 12px line of text and an 8px bar — 14px — and
   * with a 4px gap between them and the stock 12px of padding under the last
   * one three come to 62. Counting two per row asked the grid for a whole
   * spare row and the card then stood in a hole a third of its height.
   */
  levelRows(e) {
    return this.base.levels === !1 ? 0 : Math.ceil(e / 3);
  }
  /**
   * The part of that content which cannot be squeezed.
   *
   * A list of level rows lives with whatever height it is given — it spreads or
   * crowds. A row of buttons or a slider is 42px and stays 42px, so a card that
   * has one must not be allowed to shrink under it. This is what `min_rows`
   * reports, and it is why the two numbers are counted separately.
   */
  fixedRows() {
    return this.featureRows([]);
  }
  /**
   * Rows taken by the features line, counted the way the stock tile counts
   * them. The user's list wins over the card's own, exactly as it does in
   * render, and the layout arithmetic is HA's own.
   */
  featureRows(e) {
    const t = this.base.features ?? e;
    return t.length ? Ut(
      Ae(t, this.base.features_position ?? "bottom")
    ) : 0;
  }
  getCardSize() {
    return 1 + this.contentRows();
  }
  /**
   * Layout hints for a sections dashboard.
   *
   * `rows: "auto"` because the height depends on the content: a printer has five
   * ink rows, a climate card none. The stock cards with a floating height, entities
   * and heading, describe themselves the same way. Without it the card would claim
   * one row no matter what is in it.
   */
  getGridOptions() {
    return {
      columns: 6,
      rows: "auto",
      min_columns: this.base.vertical ? 3 : 6,
      // One row for the line plus whatever cannot be squeezed under it.
      min_rows: 1 + this.fixedRows()
    };
  }
  connectedCallback() {
    super.connectedCallback(), He().then((e) => {
      this._ready = e;
    });
  }
  fireMoreInfo(e) {
    this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        detail: { entityId: e },
        bubbles: !0,
        composed: !0
      })
    );
  }
  // ---- actions ---------------------------------------------------------
  _handleAction(e) {
    this._runAction(e.detail.action, !1);
  }
  _handleIconAction(e) {
    e.stopPropagation(), this._runAction(e.detail.action, !0);
  }
  _runAction(e, t) {
    if (!this.hass) return;
    const i = t ? {
      entity: this._entityId,
      tap_action: this.base.icon_tap_action ?? this._defaultIconAction,
      hold_action: this.base.icon_hold_action,
      double_tap_action: this.base.icon_double_tap_action
    } : {
      entity: this._entityId,
      tap_action: this.base.tap_action,
      hold_action: this.base.hold_action,
      double_tap_action: this.base.double_tap_action
    };
    zt(this, this.hass, i, e);
  }
  // ---- rendering -------------------------------------------------------
  /** A banner instead of the card: the config is invalid or the entity is gone. */
  renderWarning(e) {
    return p`<ha-card><div class="warning">${e}</div></ha-card>`;
  }
  /**
   * The main entity's state for the secondary line.
   *
   * When `state_content` or `time_format` is set, the stock `state-display` does
   * the rendering: it handles attributes, last changed and time formats — no
   * reason to redo that by hand.
   */
  mainStateSegment(e, t) {
    if (!e?.stateObj || e.unavailable) return;
    const i = this.base.state_content ?? t;
    return !i && !this.base.time_format ? At(this.hass, e) : {
      entityId: e.entityId,
      content: p`<state-display
        .hass=${this.hass}
        .stateObj=${e.stateObj}
        .content=${i}
        .timeFormat=${this.base.time_format}
      ></state-display>`
    };
  }
  /** A message about entities that were not found, or undefined if all are there. */
  missingRolesWarning(e) {
    const t = e.filter((i) => !!i && i.missing).map((i) => i.entityId);
    if (t.length)
      return _(
        this.hass,
        t.length === 1 ? "entity.missing.one" : "entity.missing.many",
        { list: t.join(", ") }
      );
  }
  /**
   * Wraps a value in its own tap target. The click does not bubble to the body,
   * so more-info opens for that entity rather than for the main one.
   *
   * A button rather than a span with a handler: values are targets in their own
   * right, and one has to be able to tab to them and press them from the
   * keyboard. The entity name goes into title and aria-label: "63%" on its own
   * says nothing about whose it is — neither on hover nor to a screen reader.
   */
  renderClickable(e, t) {
    if (!t) return p`<span>${e}</span>`;
    const i = this.hass?.states[t]?.attributes.friendly_name ?? t;
    return p`<button
      class="clickable"
      title=${i}
      aria-label=${i}
      @click=${(s) => {
      s.stopPropagation(), this.fireMoreInfo(t);
    }}
      >${e}</button
    >`;
  }
  renderTile(e) {
    const {
      icon: t,
      color: i,
      primary: s,
      secondary: o,
      mainEntityId: a,
      imageUrl: c,
      defaultIconAction: n,
      values: u,
      ownFeatures: f,
      customFeatures: l
    } = e;
    if (this._entityId = a, this._defaultIconAction = n, !this._ready)
      return this.renderWarning(_(this.hass, "internals.failed"));
    const d = this._tileColor(i), g = this.base.icon_tap_action ?? n, y = E(g) || E(this.base.icon_hold_action) || E(this.base.icon_double_tap_action), $ = this.base.features ?? f, v = this.base.features_position ?? "bottom", m = this.base.levels === !1 ? void 0 : l, b = Ae($, v), he = typeof this.base.grid_options?.rows == "number";
    return this.toggleAttribute(
      "filled",
      he && !!(m || b.below.length)
    ), p`
      <ha-card style="--tile-color: ${d};">
        <ha-tile-container
          .featurePosition=${v}
          .vertical=${!!this.base.vertical}
          .fixedInfoHeight=${this.layout === "grid" && he}
          .interactive=${!0}
          .actionHandlerOptions=${{
      hasHold: E(this.base.hold_action),
      hasDoubleClick: E(this.base.double_tap_action)
    }}
          @action=${this._handleAction}
        >
          <ha-tile-icon
            slot="icon"
            class=${c ? "image" : ""}
            .interactive=${y}
            .imageUrl=${c}
            .icon=${this.base.icon ?? t}
            .actionHandlerOptions=${{
      hasHold: E(this.base.icon_hold_action),
      hasDoubleClick: E(this.base.icon_double_tap_action)
    }}
            @action=${this._handleIconAction}
          ></ha-tile-icon>

          <div slot="info" class="info ${this.base.vertical ? "vertical" : ""}">
            <ha-tile-info>
              <span slot="primary">${s}</span>
              ${o?.length && !this.base.hide_state ? p`<span slot="secondary"
                    >${o.map(
      (w, J) => p`
                        ${J ? p`<span>${$t}</span>` : h}${this.renderClickable(
        w.content ?? w.text,
        w.entityId
      )}
                      `
    )}</span
                  >` : h}
            </ha-tile-info>
            ${u?.length ? p`<div class="values of-${u.length}">
                  ${u.map(
      (w, J) => p`
                      ${J ? p`<span class="values-separator">/</span>` : h}
                      ${this.renderClickable(
        p`${w.icon ? p`<ha-icon
                              class="value-icon"
                              .icon=${w.icon}
                            ></ha-icon>` : h}${w.value}${w.unit ? p`<span class="unit"> ${w.unit}</span>` : h}`,
        w.entityId
      )}
                    `
    )}
                </div>` : h}
          </div>

          ${b.inline.length ? p`<hui-card-features
                slot="features-inline"
                .hass=${this.hass}
                .context=${{ entity_id: a }}
                .color=${this.base.color}
                .features=${b.inline}
                .position=${v}
              ></hui-card-features>` : h}
          ${m ? p`<div slot="features" class="custom-features">
                ${m}
              </div>` : h}
          ${b.below.length ? p`<hui-card-features
                slot="features"
                .columns=${b.columns}
                .hass=${this.hass}
                .context=${{ entity_id: a }}
                .color=${this.base.color}
                .features=${b.below}
                .position=${"bottom"}
              ></hui-card-features>` : h}
        </ha-tile-container>
      </ha-card>
    `;
  }
  /**
   * The tile colour, by the stock tile's rule: a colour from the config counts
   * only while the entity is active — an inactive one is grey on the stock tile
   * and has to be grey here. A card assembled from a list of equal entities has
   * nothing to be active, so there its colour is taken at face value.
   */
  _tileColor(e) {
    const t = this._entityId ? this.hass?.states[this._entityId] : void 0;
    return this.base.color && (!t || Pt(t)) ? qt(this.base.color) : e ?? "var(--state-inactive-color)";
  }
  /**
   * The values of the right-hand column. `icons` names a value by its role key:
   * without it two percentages in a row are indistinguishable.
   */
  bigValues(e, t = jt) {
    return e.map((i) => {
      const s = this.formatted(i.role?.stateObj);
      return s ? {
        ...s,
        entityId: i.role?.entityId,
        icon: t[i.key]
      } : void 0;
    }).filter((i) => !!i);
  }
  /**
   * The entity picture URL — the same logic as _getImageUrl in the stock tile.
   * Cameras, with their separate size-aware URL, are not supported.
   */
  entityImage(e) {
    if (!this.base.show_entity_picture || !this.hass || !e)
      return;
    const t = e.attributes.entity_picture_local || e.attributes.entity_picture;
    return t ? this.hass.hassUrl(t) : void 0;
  }
  /** A large value ready to show. An unavailable entity has none. */
  formatted(e) {
    if (!(!this.hass || !e) && !bt.has(e.state) && !yt(e))
      return Et(
        this.hass.formatEntityState(e),
        e.attributes.unit_of_measurement
      );
  }
}
ne([
  L({ attribute: !1 })
], K.prototype, "hass");
ne([
  L({ attribute: !1 })
], K.prototype, "layout");
ne([
  D()
], K.prototype, "_ready");
function qt(r) {
  return /^(#|rgb|hsl|var\()/.test(r) ? r : r === "state" ? "var(--state-icon-color)" : `var(--${r}-color, var(--state-icon-color))`;
}
const Y = (r) => Math.max(0, Math.min(100, r)), Vt = H`
  /*
   * The rows fill whatever height they are given and spread evenly in it —
   * the same thing hui-card-features does with its own spare room, so a list
   * of rows and a stack of features behave alike on a card of a fixed height.
   */
  .levels {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    gap: var(--ha-space-1, 4px);
    height: 100%;
    min-height: 0;
  }

  /*
   * A row is its line of text and nothing more — no padding of its own.
   *
   * Three rows have to fit in one layout row, which is 64px of content: 3 * 14
   * of text plus two 4px gaps and the 12px of padding under the last one comes
   * to 62. Padding on the row itself pushed that to 74, and a card told to be
   * two rows tall then had its list spill over the bottom edge — the padding
   * under the last bar disappeared and the bar sat on the card's border.
   *
   * padding: 0 is written out because a button without it takes the browser's
   * own 1px 6px and the bars stop lining up with the texts above.
   */
  .level {
    display: flex;
    align-items: center;
    gap: var(--ha-space-2, 8px);
    width: 100%;
    padding: 0;
    border: none;
    background: none;
    font-family: inherit;
    cursor: pointer;
    border-radius: var(--ha-border-radius-sm, 6px);
  }

  .level:focus-visible {
    outline: 2px solid var(--ink);
    outline-offset: 2px;
  }

  /*
   * One width for every row, not auto: otherwise names of different lengths
   * drag the bars around and the list stops reading as one scale. A fraction
   * of the row by default, because a name is as long as the card is wide; a
   * card with short labels sets --level-name to a length of its own.
   */
  .level .name {
    flex: 0 0 var(--level-name, 34%);
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: var(--ha-font-size-s, 12px);
    color: var(--secondary-text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .level .name ha-icon {
    flex: none;
    color: var(--error-color, #db4437);
    --mdc-icon-size: 14px;
  }

  /* The row's own glyph is not an alarm and is not painted like one. */
  .level .name ha-icon.mark {
    color: var(--ink);
  }

  /*
   * The bar as in the stock hui-bar-gauge-card-feature, only thinner.
   *
   * The fill is placed on the track rather than flowing before it: a span has
   * to start away from the left edge, and a flex row can only grow from it.
   */
  .level .bar {
    flex: 1 1 auto;
    position: relative;
    height: 8px;
    border-radius: var(--ha-border-radius-pill, 9999px);
    overflow: hidden;
  }

  .level .bar .track {
    position: absolute;
    inset: 0;
    background-color: var(--ink);
    opacity: 0.2;
  }

  .level .bar .fill {
    position: absolute;
    top: 0;
    bottom: 0;
    background-color: var(--ink);
    transition:
      width 400ms ease-in-out,
      inset-inline-start 400ms ease-in-out;
  }

  /*
   * A span is rounded at both ends and never thinner than it is tall: a day
   * whose night and afternoon are the same would otherwise have no bar at all.
   */
  .level .bar .fill.span {
    border-radius: var(--ha-border-radius-pill, 9999px);
    min-width: 8px;
  }

  .level .value {
    flex: none;
    min-width: 3.2em;
    text-align: end;
    font-size: var(--ha-font-size-s, 12px);
    color: var(--primary-text-color);
    font-variant-numeric: tabular-nums;
  }

  .level.low .value {
    color: var(--error-color, #db4437);
  }

  @media (prefers-reduced-motion: reduce) {
    .level .bar .fill {
      transition: none;
    }
  }
`;
function Gt(r, e, t) {
  return p`
    <div
      class="levels"
      style=${h}
    >
      ${r.map(
    (i) => p`
          <button
            class="level ${i.alarm ? "low" : ""}"
            style="--ink: ${i.ink};"
            title="${i.name}: ${i.text}"
            @click=${(s) => {
      s.stopPropagation(), e(i.entityId);
    }}
          >
            <span class="name">
              ${i.alarm ? p`<ha-icon
                    icon=${i.alarmIcon ?? "mdi:alert-circle"}
                  ></ha-icon>` : i.icon ? p`<ha-icon class="mark" icon=${i.icon}></ha-icon>` : h}${i.name}
            </span>
            <span class="bar">
              <span class="track"></span>
              <span
                class="fill ${i.from === void 0 ? "" : "span"}"
                style="inset-inline-start: ${Y(
      i.from ?? 0
    )}%; width: ${Math.max(
      0,
      Y(i.level) - Y(i.from ?? 0)
    )}%"
              ></span>
            </span>
            <span class="value">${i.text}</span>
          </button>
        `
  )}
    </div>
  `;
}
function Kt(r) {
  return r === void 0 ? "var(--state-unavailable-color)" : r >= 70 ? "var(--state-sensor-battery-high-color, #4caf50)" : r >= 30 ? "var(--state-sensor-battery-medium-color, #ffa600)" : "var(--state-sensor-battery-low-color, #db4437)";
}
const Le = Kt;
let ke = !1;
function Zt(r) {
  ke || (ke = !0, console.warn(
    `horos-cards: card ${r} is already registered. The bundle looks to be attached to the dashboard twice — the copy that loaded first is the one running. Check the dashboard resources.`
  ));
}
function Ce() {
  const r = document.querySelector("home-assistant");
  return Ue(r?.hass);
}
function De(r, e, t) {
  if (customElements.get(r)) {
    Zt(r);
    return;
  }
  customElements.define(r, e), window.customCards = window.customCards ?? [], window.customCards.push({
    type: t.type,
    preview: t.preview,
    get name() {
      return typeof t.name == "string" ? t.name : t.name[Ce() === "ru" ? "ru" : "en"] ?? t.name.en;
    },
    get description() {
      return typeof t.description == "string" ? t.description : t.description[Ce() === "ru" ? "ru" : "en"] ?? t.description.en;
    },
    getEntitySuggestion: t.suggest
  });
}
function je(r, e) {
  customElements.get(r) || customElements.define(r, e);
}
var Jt = Object.defineProperty, Qt = (r, e, t, i) => {
  for (var s = void 0, o = r.length - 1, a; o >= 0; o--)
    (a = r[o]) && (s = a(e, t, s) || s);
  return s && Jt(e, t, s), s;
};
class Fe extends K {
  static {
    this.styles = [
      Re,
      Vt,
      H`
      .quick-actions {
        display: flex;
        gap: 8px;
        align-items: center;
        margin-top: 6px;
      }
      .action-chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px;
        border-radius: var(--ha-border-radius-pill, 9999px);
        background: var(--secondary-background-color);
        border: 1px solid var(--divider-color, rgba(128, 128, 128, 0.2));
        color: var(--primary-text-color);
        font-size: var(--ha-font-size-s, 12px);
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s ease, border-color 0.2s ease;
      }
      .action-chip:hover {
        background: var(--state-hover-color, rgba(128, 128, 128, 0.15));
      }
      .action-chip.active {
        background: var(--warning-color, #ffa600);
        color: #fff;
        border-color: transparent;
      }
      .action-chip ha-icon {
        --mdc-icon-size: 14px;
      }
    `
    ];
  }
  contentRows() {
    return this.levelRows(1) + this.fixedRows();
  }
  static async getConfigElement() {
    return await Promise.resolve().then(() => ti), document.createElement(
      "horos-charger-tile-editor"
    );
  }
  static getStubConfig() {
    return {
      entity: "",
      switch: "",
      power: ""
    };
  }
  setConfig(e) {
    if (!e.entity && !e.switch)
      throw new Error("Either entity or switch is required");
    this.base = e, this._config = e;
  }
  _getChargerData() {
    if (!this._config || !this.hass) return null;
    const e = this._config;
    let t = "idle", i = 0, s = null, o = null, a = null, c = null, n = !1, u = e.switch;
    const f = e.entity || e.switch;
    if (e.entity && this.hass.states[e.entity]) {
      const l = this.hass.states[e.entity];
      if (l) {
        t = l.state;
        const d = l.attributes;
        i = Number(d.power_w) || 0, s = d.connected_device ? String(d.connected_device) : null, o = d.battery_level !== void 0 && d.battery_level !== null ? Number(d.battery_level) : null, a = d.min_charge !== void 0 && d.min_charge !== null ? Number(d.min_charge) : null, c = d.max_charge !== void 0 && d.max_charge !== null ? Number(d.max_charge) : null, n = !!d.is_probing, !u && d.switch_entity && (u = String(d.switch_entity));
      }
    } else if (e.switch && this.hass.states[e.switch]) {
      const l = this.hass.states[e.switch], d = l ? l.state === "on" : !1;
      if (e.power && this.hass.states[e.power]) {
        const g = this.hass.states[e.power];
        i = g && parseFloat(g.state) || 0;
      }
      t = d ? i > 2.5 ? "charging" : "generic" : "idle";
    }
    return e.device_name && (s = e.device_name), {
      state: t,
      powerW: i,
      connectedDevice: s,
      batteryLevel: o,
      minCharge: a,
      maxCharge: c,
      isProbing: n,
      switchEntity: u,
      mainEntityId: f
    };
  }
  async _handleForce100(e) {
    if (e.stopPropagation(), !this.hass || !this._config) return;
    const t = this._getChargerData();
    if (t) {
      if (this._config.force_100_button) {
        await this.hass.callService("button", "press", {
          entity_id: this._config.force_100_button
        });
        return;
      }
      if (this.hass.services?.smart_charger?.force_100) {
        await this.hass.callService("smart_charger", "force_100", {
          charger_id: t.switchEntity
        });
        return;
      }
      t.switchEntity && await this.hass.callService("switch", "turn_on", {
        entity_id: t.switchEntity
      });
    }
  }
  async _handleStop(e) {
    if (e.stopPropagation(), !this.hass || !this._config) return;
    const t = this._getChargerData();
    if (t) {
      if (this.hass.services?.smart_charger?.stop) {
        await this.hass.callService("smart_charger", "stop", {
          charger_id: t.switchEntity
        });
        return;
      }
      t.switchEntity && await this.hass.callService("switch", "turn_off", {
        entity_id: t.switchEntity
      });
    }
  }
  render() {
    if (!this._config || !this.hass) return h;
    const e = this._config, t = this._getChargerData();
    if (!t) return h;
    const {
      state: i,
      powerW: s,
      connectedDevice: o,
      batteryLevel: a,
      minCharge: c,
      maxCharge: n,
      isProbing: u,
      switchEntity: f,
      mainEntityId: l
    } = t;
    let d = "mdi:power-plug-outline", g = "var(--state-inactive-color, #7b7b7b)";
    i === "charging" ? (d = "mdi:battery-charging", g = "var(--success-color, #43a047)") : i === "manual_100" ? (d = "mdi:battery-charging-100", g = "var(--warning-color, #ffa600)") : i === "cooldown" || i === "sleep" ? (d = "mdi:battery-clock", g = "var(--info-color, #0288d1)") : i === "generic" && (d = "mdi:power-plug", g = "var(--accent-color, #7e57c2)");
    const y = _(this.hass, `charger.${i}`), $ = [];
    u ? $.push(_(this.hass, "charger.probing")) : o ? ($.push(o), $.push(y)) : i !== "idle" ? $.push(y) : $.push(_(this.hass, "charger.idle"));
    const v = [];
    if (o && a !== null) {
      const b = n ? `${Math.round(a)}% / ${n}%` : `${Math.round(a)}%`;
      v.push({
        entityId: l ?? "",
        name: o,
        text: b,
        ink: Le(a),
        level: a,
        icon: i === "charging" ? "mdi:battery-charging" : "mdi:battery",
        alarm: c !== null ? a < c : a < 20
      });
    }
    const m = p`
      ${v.length ? Gt(v, (b) => this.fireMoreInfo(b)) : h}
      <div class="quick-actions">
        <button
          class="action-chip ${i === "manual_100" ? "active" : ""}"
          @click=${this._handleForce100}
        >
          <ha-icon icon="mdi:battery-charging-100"></ha-icon>
          ${_(this.hass, "charger.force_100")}
        </button>
        ${i !== "idle" ? p`
              <button class="action-chip" @click=${this._handleStop}>
                <ha-icon icon="mdi:stop"></ha-icon>
                ${_(this.hass, "charger.stop")}
              </button>
            ` : h}
      </div>
    `;
    return this.renderTile({
      icon: d,
      color: g,
      primary: e.name ?? (f && this.hass.states[f]?.attributes.friendly_name) ?? _(this.hass, "charger.title"),
      mainEntityId: l,
      secondary: xt(
        $.map((b) => ({ text: b }))
      ),
      values: [
        {
          value: `${s.toFixed(s >= 10 ? 0 : 1)} W`,
          icon: "mdi:flash",
          entityId: e.power ?? f
        },
        ...a !== null ? [
          {
            value: `${Math.round(a)}%`,
            icon: "mdi:battery",
            entityId: l
          }
        ] : []
      ],
      customFeatures: m
    });
  }
}
Qt([
  D()
], Fe.prototype, "_config");
De("horos-charger-tile", Fe, {
  type: "horos-charger-tile",
  name: "Smart charger (tile)",
  description: "Smart charging socket: connected device, power draw and battery level",
  preview: !0
});
var Yt = Object.defineProperty, We = (r, e, t, i) => {
  for (var s = void 0, o = r.length - 1, a; o >= 0; o--)
    (a = r[o]) && (s = a(e, t, s) || s);
  return s && Yt(e, t, s), s;
};
class ce extends C {
  static {
    this.styles = H`
    :host {
      display: block;
    }

    ha-card {
      padding: var(--ha-space-3, 12px) var(--ha-space-4, 16px);
      background: var(--ha-card-background, var(--card-background-color, white));
      border-radius: var(--ha-card-border-radius, var(--ha-border-radius-lg, 12px));
      box-shadow: var(--ha-card-box-shadow, none);
      border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--divider-color, #e0e0e0));
      box-sizing: border-box;
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding-bottom: 12px;
      margin-bottom: 4px;
      border-bottom: 1px solid var(--divider-color, rgba(128, 128, 128, 0.15));
    }

    .header-icon {
      color: var(--primary-color);
      --mdc-icon-size: 22px;
      display: flex;
      align-items: center;
    }

    .header-title {
      font-size: var(--ha-font-size-m, 16px);
      font-weight: 600;
      color: var(--primary-text-color);
      flex: 1;
    }

    .header-badge {
      font-size: var(--ha-font-size-s, 12px);
      color: var(--secondary-text-color);
      background: var(--secondary-background-color, rgba(128, 128, 128, 0.1));
      padding: 2px 8px;
      border-radius: var(--ha-border-radius-pill, 9999px);
      font-weight: 500;
    }

    .chargers-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 8px;
    }

    .charger-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 8px 10px;
      border-radius: var(--ha-border-radius-md, 8px);
      background: var(--secondary-background-color, rgba(128, 128, 128, 0.04));
      border: 1px solid var(--divider-color, rgba(128, 128, 128, 0.08));
      transition: background-color 0.2s ease;
    }

    .charger-item:hover {
      background: var(--state-hover-color, rgba(128, 128, 128, 0.08));
    }

    .row-top {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
    }

    .socket-icon {
      width: 38px;
      height: 38px;
      border-radius: var(--ha-border-radius-pill, 9999px);
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--icon-bg, rgba(128, 128, 128, 0.12));
      color: var(--icon-color, var(--secondary-text-color));
      flex-shrink: 0;
      transition: background-color 0.3s ease, color 0.3s ease;
    }

    .socket-icon ha-icon {
      --mdc-icon-size: 20px;
    }

    .socket-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .primary-line {
      display: flex;
      align-items: center;
      gap: 8px;
      white-space: nowrap;
      overflow: hidden;
    }

    .socket-name {
      font-size: var(--ha-font-size-m, 14px);
      font-weight: 500;
      color: var(--primary-text-color);
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .device-pill {
      font-size: 11px;
      padding: 2px 7px;
      border-radius: 6px;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      max-width: 140px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .device-pill.charging {
      background: rgba(67, 160, 71, 0.15);
      color: var(--success-color, #43a047);
    }

    .device-pill.manual_100 {
      background: rgba(255, 166, 0, 0.15);
      color: var(--warning-color, #ffa600);
    }

    .device-pill.cooldown,
    .device-pill.sleep {
      background: rgba(2, 136, 209, 0.15);
      color: var(--info-color, #0288d1);
    }

    .device-pill.generic {
      background: rgba(126, 87, 194, 0.15);
      color: var(--accent-color, #7e57c2);
    }

    .device-pill.idle {
      background: var(--divider-color, rgba(128, 128, 128, 0.1));
      color: var(--secondary-text-color);
    }

    .secondary-line {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: var(--ha-font-size-s, 12px);
      color: var(--secondary-text-color);
    }

    .dot-sep {
      opacity: 0.6;
    }

    .power-val {
      font-weight: 600;
      color: var(--primary-text-color);
      font-variant-numeric: tabular-nums;
    }

    .row-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }

    .btn-100 {
      padding: 3px 8px;
      font-size: 11px;
      font-weight: 600;
      border-radius: 12px;
      border: 1px solid var(--divider-color, rgba(128, 128, 128, 0.25));
      background: var(--card-background-color, white);
      color: var(--primary-text-color);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-100:hover {
      background: var(--warning-color, #ffa600);
      color: white;
      border-color: transparent;
    }

    .btn-100.active {
      background: var(--warning-color, #ffa600);
      color: white;
      border-color: transparent;
    }

    .battery-row {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding-top: 4px;
      border-top: 1px dashed var(--divider-color, rgba(128, 128, 128, 0.12));
    }

    .battery-bar-wrap {
      position: relative;
      height: 7px;
      background: var(--bar-track, rgba(128, 128, 128, 0.18));
      border-radius: 9999px;
      overflow: visible;
    }

    .battery-bar-fill {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      border-radius: 9999px;
      transition: width 0.4s ease-in-out;
    }

    .battery-bar-limit {
      position: absolute;
      top: -2px;
      bottom: -2px;
      width: 2px;
      background: var(--primary-text-color);
      opacity: 0.7;
      border-radius: 1px;
      z-index: 2;
    }

    .battery-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: var(--secondary-text-color);
    }

    .battery-meta .pct {
      font-weight: 600;
      color: var(--primary-text-color);
    }

    .empty-state {
      padding: 16px;
      text-align: center;
      color: var(--secondary-text-color);
      font-size: var(--ha-font-size-s, 13px);
    }
  `;
  }
  static async getConfigElement() {
    return await Promise.resolve().then(() => ii), document.createElement(
      "horos-chargers-card-editor"
    );
  }
  static getStubConfig() {
    return {
      title: "Smart Charging",
      chargers: []
    };
  }
  setConfig(e) {
    this._config = e;
  }
  _resolveChargers() {
    if (!this.hass) return [];
    const e = this._config, t = [];
    if (e?.chargers && e.chargers.length > 0) {
      for (const o of e.chargers) {
        const a = typeof o == "string" ? { switch: o } : o;
        let c = a.entity ?? null;
        const n = a.switch ?? null, u = a.power ?? null, f = a.name;
        if (!c && n) {
          const d = Object.keys(this.hass.states).find(
            (g) => g.startsWith("sensor.") && this.hass.states[g]?.attributes.switch_entity === n
          );
          d && (c = d);
        }
        const l = this._buildResolved(
          c,
          n,
          u,
          f,
          a.device_name
        );
        l && t.push(l);
      }
      return t;
    }
    const i = Object.keys(this.hass.states).filter(
      (o) => o.startsWith("sensor.") && this.hass.states[o]?.attributes.charger_id !== void 0
    );
    if (i.length > 0) {
      for (const o of i) {
        const a = this._buildResolved(o, null, null, void 0, void 0);
        a && t.push(a);
      }
      return t;
    }
    const s = Object.keys(this.hass.states).filter(
      (o) => o.startsWith("switch.") && (o.includes("plug") || o.includes("charger") || o.includes("socket"))
    );
    for (const o of s) {
      const a = Object.keys(this.hass.states).find(
        (n) => n.startsWith("sensor.") && (n.includes(o.replace("switch.", "")) || n.includes(o.replace("switch.device_plug_", ""))) && n.endsWith("_power")
      ), c = this._buildResolved(null, o, a ?? null, void 0, void 0);
      c && t.push(c);
    }
    return t;
  }
  _buildResolved(e, t, i, s, o) {
    if (!this.hass) return null;
    let a = "idle", c = 0, n = o ?? null, u = null, f = null, l = null, d = !1, g = !1, y = s;
    if (e && this.hass.states[e]) {
      const v = this.hass.states[e];
      if (v) {
        a = v.state;
        const m = v.attributes;
        c = Number(m.power_w) || 0, n = m.connected_device ? String(m.connected_device) : n, u = m.battery_level !== void 0 && m.battery_level !== null ? Number(m.battery_level) : null, f = m.min_charge !== void 0 && m.min_charge !== null ? Number(m.min_charge) : null, l = m.max_charge !== void 0 && m.max_charge !== null ? Number(m.max_charge) : null, d = !!m.is_probing, !t && m.switch_entity && (t = String(m.switch_entity)), !y && m.charger_name && (y = String(m.charger_name));
      }
    }
    if (t && this.hass.states[t]) {
      const v = this.hass.states[t];
      if (v && (g = v.state === "on", y || (y = v.attributes.friendly_name ?? t)), !i && e === null) {
        const m = Object.keys(this.hass.states).find(
          (b) => b.startsWith("sensor.") && b.includes(t.replace("switch.", "")) && b.endsWith("_power")
        );
        m && (i = m);
      }
    }
    if (i && this.hass.states[i] && e === null) {
      const v = this.hass.states[i];
      c = v && parseFloat(v.state) || 0, a = g ? c > 2.5 ? "charging" : "generic" : "idle";
    }
    const $ = e ?? t ?? "unknown";
    return {
      id: $,
      name: y ?? $,
      state: a,
      powerW: c,
      connectedDevice: n,
      batteryLevel: u,
      minCharge: f,
      maxCharge: l,
      isProbing: d,
      switchEntity: t,
      statusEntity: e,
      isSwitchOn: g
    };
  }
  _openMoreInfo(e) {
    e && this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        detail: { entityId: e },
        bubbles: !0,
        composed: !0
      })
    );
  }
  async _handleToggleSocket(e, t) {
    e.stopPropagation(), !(!this.hass || !t.switchEntity) && await this.hass.callService("switch", "toggle", {
      entity_id: t.switchEntity
    });
  }
  async _handleForce100(e, t) {
    if (e.stopPropagation(), !!this.hass) {
      if (this.hass.services?.smart_charger?.force_100) {
        await this.hass.callService("smart_charger", "force_100", {
          charger_id: t.switchEntity ?? t.id
        });
        return;
      }
      t.switchEntity && await this.hass.callService("switch", "turn_on", {
        entity_id: t.switchEntity
      });
    }
  }
  render() {
    if (!this.hass) return h;
    const e = this._resolveChargers(), t = this._config?.title ?? _(this.hass, "charger.title"), i = e.filter(
      (s) => s.state === "charging" || s.state === "manual_100"
    ).length;
    return p`
      <ha-card>
        <div class="card-header">
          <div class="header-icon">
            <ha-icon icon="mdi:battery-charging-wireless"></ha-icon>
          </div>
          <div class="header-title">${t}</div>
          <div class="header-badge">
            ${i > 0 ? `${i} / ${e.length}` : _(this.hass, "charger.idle")}
          </div>
        </div>

        ${e.length ? p`
              <div class="chargers-list">
                ${e.map((s) => this._renderChargerRow(s))}
              </div>
            ` : p`<div class="empty-state">${_(this.hass, "charger.noChargers")}</div>`}
      </ha-card>
    `;
  }
  _renderChargerRow(e) {
    let t = "mdi:power-plug-outline", i = "var(--secondary-text-color)", s = "rgba(128, 128, 128, 0.1)";
    e.state === "charging" ? (t = "mdi:battery-charging", i = "var(--success-color, #43a047)", s = "rgba(67, 160, 71, 0.15)") : e.state === "manual_100" ? (t = "mdi:battery-charging-100", i = "var(--warning-color, #ffa600)", s = "rgba(255, 166, 0, 0.15)") : e.state === "cooldown" || e.state === "sleep" ? (t = "mdi:battery-clock", i = "var(--info-color, #0288d1)", s = "rgba(2, 136, 209, 0.15)") : e.state === "generic" && (t = "mdi:power-plug", i = "var(--accent-color, #7e57c2)", s = "rgba(126, 87, 194, 0.15)");
    const o = e.isProbing ? _(this.hass, "charger.probing") : _(this.hass, `charger.${e.state}`);
    let a = "mdi:cellphone";
    e.connectedDevice?.toLowerCase().includes("watch") ? a = "mdi:watch" : e.connectedDevice?.toLowerCase().includes("tablet") && (a = "mdi:tablet");
    const c = e.statusEntity ?? e.switchEntity;
    return p`
      <div class="charger-item">
        <div
          class="row-top"
          @click=${() => this._openMoreInfo(c)}
        >
          <div
            class="socket-icon"
            style="--icon-color: ${i}; --icon-bg: ${s};"
          >
            <ha-icon .icon=${t}></ha-icon>
          </div>

          <div class="socket-info">
            <div class="primary-line">
              <span class="socket-name">${e.name}</span>
              ${e.connectedDevice ? p`
                    <span class="device-pill ${e.state}">
                      <ha-icon icon=${a} style="--mdc-icon-size: 13px;"></ha-icon>
                      ${e.connectedDevice}
                    </span>
                  ` : e.state === "generic" ? p`
                    <span class="device-pill generic">
                      ${_(this.hass, "charger.generic")}
                    </span>
                  ` : p`
                    <span class="device-pill idle">
                      ${_(this.hass, "charger.idle")}
                    </span>
                  `}
            </div>
            <div class="secondary-line">
              <span>${o}</span>
              <span class="dot-sep">·</span>
              <span class="power-val">${e.powerW.toFixed(e.powerW >= 10 ? 0 : 1)} W</span>
            </div>
          </div>

          <div class="row-actions">
            <button
              class="btn-100 ${e.state === "manual_100" ? "active" : ""}"
              title="${_(this.hass, "charger.force_100")}"
              @click=${(n) => this._handleForce100(n, e)}
            >
              100%
            </button>
            ${e.switchEntity ? p`
                  <ha-switch
                    .checked=${e.isSwitchOn}
                    @click=${(n) => n.stopPropagation()}
                    @change=${(n) => this._handleToggleSocket(n, e)}
                  ></ha-switch>
                ` : h}
          </div>
        </div>

        ${e.batteryLevel !== null ? p`
              <div class="battery-row">
                <div class="battery-bar-wrap">
                  <span
                    class="battery-bar-fill"
                    style="width: ${e.batteryLevel}%; background-color: ${Le(e.batteryLevel)};"
                  ></span>
                  ${e.maxCharge ? p`
                        <span
                          class="battery-bar-limit"
                          style="left: ${e.maxCharge}%;"
                          title="Target limit: ${e.maxCharge}%"
                        ></span>
                      ` : h}
                </div>
                <div class="battery-meta">
                  <span>${e.connectedDevice}</span>
                  <span class="pct">
                    ${Math.round(e.batteryLevel)}%
                    ${e.maxCharge ? ` / ${e.maxCharge}%` : ""}
                  </span>
                </div>
              </div>
            ` : h}
      </div>
    `;
  }
}
We([
  L({ attribute: !1 })
], ce.prototype, "hass");
We([
  D()
], ce.prototype, "_config");
De("horos-chargers-card", ce, {
  type: "horos-chargers-card",
  name: "Smart chargers list",
  description: "List of all charging sockets showing connected devices and battery levels",
  preview: !0
});
console.info(
  "%c HOROS-SMART-CHARGING %c 0.1.0 ",
  "background:#43a047;color:#fff;border-radius:3px 0 0 3px;padding:2px 4px",
  "background:#555;color:#fff;border-radius:0 3px 3px 0;padding:2px 4px"
);
var Xt = Object.defineProperty, le = (r, e, t, i) => {
  for (var s = void 0, o = r.length - 1, a; o >= 0; o--)
    (a = r[o]) && (s = a(e, t, s) || s);
  return s && Xt(e, t, s), s;
};
class Z extends C {
  constructor() {
    super(...arguments), this._computeHelper = (e) => e.name === "color" ? "Inactive state (for example, off or closed) will not be coloured." : void 0, this._computeLabel = (e) => this.labels[e.name] ?? qe[e.name] ?? e.name;
  }
  static {
    this.styles = H`
    ha-form {
      display: block;
      margin-bottom: var(--ha-space-6, 24px);
    }

    ha-expansion-panel {
      display: block;
      --expansion-panel-content-padding: 0;
      border-radius: var(--ha-border-radius-md, 12px);
      --ha-card-border-radius: var(--ha-border-radius-md, 12px);
    }

    ha-expansion-panel .content {
      padding: var(--ha-space-3, 12px);
    }

    ha-expansion-panel > *[slot="header"] {
      margin: 0;
      font-size: inherit;
      font-weight: inherit;
    }

    ha-expansion-panel ha-icon,
    ha-expansion-panel ha-svg-icon {
      color: var(--secondary-text-color);
    }

    /* The features position selector sits inside the panel, not after it. */
    .features-form {
      margin-top: var(--ha-space-6, 24px);
      margin-bottom: 0;
    }
  `;
  }
  setConfig(e) {
    this._config = e;
  }
  /** What to show the form. The config itself by default. */
  get formData() {
    return this._config ?? {};
  }
  /** What to put into the config from the form. */
  fromForm(e) {
    return e;
  }
  /**
   * Labels in the user's language. They are kept as a pair right next to the card
   * rather than in a shared dictionary: the same field is called differently on
   * different cards — "Battery", "Sensor battery", "Main device battery".
   */
  pick(e) {
    return e.en;
  }
  fireConfigChanged(e) {
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: e },
        bubbles: !0,
        composed: !0
      })
    );
  }
  _valueChanged(e) {
    e.stopPropagation(), this.fireConfigChanged(
      this.fromForm(e.detail.value)
    );
  }
  renderForm() {
    return !this.hass || !this._config ? h : p`
      <ha-form
        .hass=${this.hass}
        .data=${this.formData}
        .schema=${this.schema}
        .computeLabel=${this._computeLabel}
        .computeHelper=${this._computeHelper}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }
  render() {
    return this.renderForm();
  }
}
le([
  L({ attribute: !1 })
], Z.prototype, "hass");
le([
  D()
], Z.prototype, "_config");
class Be extends Z {
  constructor() {
    super(...arguments), this._featuresEditorReady = !1;
  }
  connectedCallback() {
    super.connectedCallback(), Dt().then((e) => {
      this._featuresEditorReady = e;
    });
  }
  /**
   * The form shows the layout as pictures (content_layout) while the config holds
   * a boolean vertical — exactly as in the stock tile's editor.
   */
  get formData() {
    const { vertical: e, ...t } = this._config ?? {};
    return {
      ...t,
      content_layout: e ? "vertical" : "horizontal"
    };
  }
  /**
   * What the card puts under the line when the config says nothing about it.
   * The editor shows those as the current list — that is what makes them
   * switchable: a card's own controls are removed the same way a stock feature
   * is, and there is no second switch for them anywhere else.
   */
  defaultFeatures() {
    return [];
  }
  _featuresChanged(e) {
    e.stopPropagation(), this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: {
          config: { ...this._config, features: e.detail.features }
        },
        bubbles: !0,
        composed: !0
      })
    );
  }
  /**
   * A feature with settings of its own — a gauge's bounds, the list of modes —
   * is edited in a sub-view of the card dialog. The dialog opens it in response
   * to `edit-sub-element`; without this the pencil on a feature does nothing.
   */
  _editFeature(e) {
    e.stopPropagation();
    const t = e.detail.subElementConfig?.index;
    if (t === void 0) return;
    const i = this._config?.features ?? this.defaultFeatures();
    this.dispatchEvent(
      new CustomEvent("edit-sub-element", {
        detail: {
          type: "feature",
          config: i[t],
          context: { entity_id: this.featuresEntity },
          saveConfig: (s) => {
            const o = [...i];
            o[t] = s, this.dispatchEvent(
              new CustomEvent("config-changed", {
                detail: { config: { ...this._config, features: o } },
                bubbles: !0,
                composed: !0
              })
            );
          }
        },
        bubbles: !0,
        composed: !0
      })
    );
  }
  fromForm(e) {
    const { content_layout: t, ...i } = e, s = { ...i };
    return t === "vertical" && (s.vertical = !0), s;
  }
  /** The features section repeats the markup of the stock tile's editor. */
  /**
   * The entity the features act on. Usually the card's main one; a card built
   * from a list of equal entities has to name one itself, or the panel has
   * nothing to address the features to and stays hidden.
   */
  get featuresEntity() {
    return this.entityField ? this._config?.[this.entityField] : void 0;
  }
  _renderFeatures() {
    const e = this.featuresEntity;
    if (!e) return h;
    const t = this._config?.features ?? this.defaultFeatures(), i = qe, s = {
      bottom: "Bottom",
      bottom_description: "Displays all features stacked",
      inline: "Inline",
      inline_description: "Displays features in two columns, starting next to the name",
      helper_vertical: "Always displayed at the bottom if the content layout is vertical"
    }, o = (n, u) => this.hass?.localize(`ui.panel.lovelace.editor.card.tile.${n}`) || u, a = !!this._config?.vertical, c = {
      ...this._config,
      features_position: a ? "bottom" : this._config?.features_position ?? "bottom"
    };
    return p`
      <ha-expansion-panel outlined>
        <ha-icon slot="leading-icon" icon="mdi:list-box"></ha-icon>
        <h3 slot="header">${i.features}</h3>
        <div class="content">
          <hui-card-features-editor
            .hass=${this.hass}
            .context=${{ entity_id: e }}
            .features=${t}
            @features-changed=${this._featuresChanged}
            @edit-detail-element=${this._editFeature}
          ></hui-card-features-editor>
          ${t.length ? p`
                <ha-form
                  class="features-form"
                  .hass=${this.hass}
                  .data=${c}
                  .schema=${[
      {
        name: "features_position",
        required: !0,
        selector: {
          select: {
            mode: "box",
            options: ["bottom", "inline"].map(
              (n) => ({
                value: n,
                label: o(
                  `features_position_options.${n}`,
                  s[n]
                ),
                description: o(
                  `features_position_options.${n}_description`,
                  s[`${n}_description`]
                ),
                image: {
                  src: `/static/images/form/tile_features_position_${n}.svg`,
                  src_dark: `/static/images/form/tile_features_position_${n}_dark.svg`,
                  flip_rtl: !0
                },
                disabled: a && n === "inline"
              })
            )
          }
        }
      }
    ]}
                  .computeLabel=${this._computeLabel}
                  .computeHelper=${() => a ? o(
      "features_position_helper_vertical",
      s.helper_vertical
    ) : void 0}
                  @value-changed=${this._valueChanged}
                ></ha-form>
              ` : h}
        </div>
      </ha-expansion-panel>
    `;
  }
  render() {
    return !this.hass || !this._config ? h : p`
      ${this.renderForm()}
      ${this._featuresEditorReady ? this._renderFeatures() : h}
    `;
  }
}
le([
  D()
], Be.prototype, "_featuresEditorReady");
const X = (r) => r ? { entity_id: r, area_id: "area" } : void 0, ei = (r, e) => ({
  name: "interactions",
  type: "expandable",
  flatten: !0,
  icon: "mdi:gesture-tap",
  schema: [
    {
      name: "tap_action",
      selector: { ui_action: { default_action: "more-info" } },
      context: X(r)
    },
    { name: "", type: "divider" },
    {
      name: "icon_tap_action",
      selector: { ui_action: { default_action: e } },
      context: X(r)
    },
    {
      name: "",
      type: "optional_actions",
      flatten: !0,
      schema: [
        "hold_action",
        "icon_hold_action",
        "double_tap_action",
        "icon_double_tap_action"
      ].map((t) => ({
        name: t,
        selector: { ui_action: { default_action: "none" } },
        context: X(r)
      }))
    }
  ]
}), qe = {
  content: "Content",
  state_content: "State content",
  time_format: "Time format",
  interactions: "Interactions",
  icon: "Icon",
  color: "Colour",
  content_layout: "Layout",
  show_entity_picture: "Show entity picture",
  hide_state: "Hide state",
  features: "Features",
  features_position: "Features position",
  tap_action: "Tap on card",
  hold_action: "Hold on card",
  double_tap_action: "Double tap on card",
  icon_tap_action: "Tap on icon",
  icon_hold_action: "Hold on icon",
  icon_double_tap_action: "Double tap on icon"
}, ee = (r, e) => ({
  entity: {
    filter: e ? { domain: r, device_class: e } : { domain: r }
  }
});
class Ve extends Be {
  get entityField() {
    return "entity";
  }
  get schema() {
    return [
      { name: "name", selector: { text: {} } },
      { name: "entity", selector: ee("sensor") },
      { name: "switch", selector: ee("switch") },
      { name: "power", selector: ee("sensor", "power") },
      ei("switch", "toggle")
    ];
  }
  get labels() {
    return {
      name: "Name",
      entity: "Status sensor (smart_charger)",
      switch: "Socket switch",
      power: "Power sensor"
    };
  }
}
je("horos-charger-tile-editor", Ve);
const ti = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  HorosChargerTileEditor: Ve
}, Symbol.toStringTag, { value: "Module" }));
class Ge extends Z {
  get schema() {
    return [
      { name: "title", selector: { text: {} } },
      {
        name: "chargers",
        selector: {
          entity: {
            multiple: !0,
            filter: [
              { domain: "switch" },
              { domain: "sensor" }
            ]
          }
        }
      }
    ];
  }
  get labels() {
    return {
      title: "Title",
      chargers: "Chargers (leave empty to auto-discover)"
    };
  }
}
je("horos-chargers-card-editor", Ge);
const ii = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  HorosChargersCardEditor: Ge
}, Symbol.toStringTag, { value: "Module" }));
