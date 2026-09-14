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
  const t = r.length === 1 ? r[0] : e.reduce((i, s, n) => i + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s) + r[n + 1], r[0]);
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
    const { get: s, set: n } = Ye(this.prototype, e) ?? { get() {
      return this[t];
    }, set(o) {
      this[t] = o;
    } };
    return { get: s, set(o) {
      const c = s?.call(this);
      n?.call(this, o), this.requestUpdate(e, c, i);
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
      const n = (i.converter?.toAttribute !== void 0 ? i.converter : B).toAttribute(t, i.type);
      this._$Em = e, n == null ? this.removeAttribute(s) : this.setAttribute(s, n), this._$Em = null;
    }
  }
  _$AK(e, t) {
    const i = this.constructor, s = i._$Eh.get(e);
    if (s !== void 0 && this._$Em !== s) {
      const n = i.getPropertyOptions(s), o = typeof n.converter == "function" ? { fromAttribute: n.converter } : n.converter?.fromAttribute !== void 0 ? n.converter : B;
      this._$Em = s;
      const c = o.fromAttribute(t, n.type);
      this[s] = c ?? this._$Ej?.get(s) ?? c, this._$Em = null;
    }
  }
  requestUpdate(e, t, i, s = !1, n) {
    if (e !== void 0) {
      const o = this.constructor;
      if (s === !1 && (n = this[e]), i ??= o.getPropertyOptions(e), !((i.hasChanged ?? se)(n, t) || i.useDefault && i.reflect && n === this._$Ej?.get(e) && !this.hasAttribute(o._$Eu(e, i)))) return;
      this.C(e, t, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, t, { useDefault: i, reflect: s, wrapped: n }, o) {
    i && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, o ?? t ?? this[e]), n !== !0 || o !== void 0) || (this._$AL.has(e) || (this.hasUpdated || i || (t = void 0), this._$AL.set(e, t)), s === !0 && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
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
        for (const [s, n] of this._$Ep) this[s] = n;
        this._$Ep = void 0;
      }
      const i = this.constructor.elementProperties;
      if (i.size > 0) for (const [s, n] of i) {
        const { wrapped: o } = n, c = this[s];
        o !== !0 || this._$AL.has(s) || c === void 0 || this.C(s, void 0, n, c);
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
const re = globalThis, ge = (r) => r, q = re.trustedTypes, me = q ? q.createPolicy("lit-html", { createHTML: (r) => r }) : void 0, Pe = "$lit$", x = `lit$${Math.random().toFixed(9).slice(2)}$`, Oe = "?" + x, rt = `<${Oe}>`, S = document, z = () => S.createComment(""), M = (r) => r === null || typeof r != "object" && typeof r != "function", ne = Array.isArray, nt = (r) => ne(r) || typeof r?.[Symbol.iterator] == "function", Q = `[ 	
\f\r]`, I = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, ve = /-->/g, _e = />/g, A = RegExp(`>|${Q}(?:([^\\s"'>=/]+)(${Q}*=${Q}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), be = /'/g, ye = /"/g, Te = /^(?:script|style|textarea|title)$/i, ot = (r) => (e, ...t) => ({ _$litType$: r, strings: e, values: t }), u = ot(1), O = Symbol.for("lit-noChange"), l = Symbol.for("lit-nothing"), we = /* @__PURE__ */ new WeakMap(), E = S.createTreeWalker(S, 129);
function Ie(r, e) {
  if (!ne(r) || !r.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return me !== void 0 ? me.createHTML(e) : e;
}
const at = (r, e) => {
  const t = r.length - 1, i = [];
  let s, n = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", o = I;
  for (let c = 0; c < t; c++) {
    const a = r[c];
    let p, f, h = -1, d = 0;
    for (; d < a.length && (o.lastIndex = d, f = o.exec(a), f !== null); ) d = o.lastIndex, o === I ? f[1] === "!--" ? o = ve : f[1] !== void 0 ? o = _e : f[2] !== void 0 ? (Te.test(f[2]) && (s = RegExp("</" + f[2], "g")), o = A) : f[3] !== void 0 && (o = A) : o === A ? f[0] === ">" ? (o = s ?? I, h = -1) : f[1] === void 0 ? h = -2 : (h = o.lastIndex - f[2].length, p = f[1], o = f[3] === void 0 ? A : f[3] === '"' ? ye : be) : o === ye || o === be ? o = A : o === ve || o === _e ? o = I : (o = A, s = void 0);
    const g = o === A && r[c + 1].startsWith("/>") ? " " : "";
    n += o === I ? a + rt : h >= 0 ? (i.push(p), a.slice(0, h) + Pe + a.slice(h) + x + g) : a + x + (h === -2 ? c : g);
  }
  return [Ie(r, n + (r[t] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), i];
};
class N {
  constructor({ strings: e, _$litType$: t }, i) {
    let s;
    this.parts = [];
    let n = 0, o = 0;
    const c = e.length - 1, a = this.parts, [p, f] = at(e, t);
    if (this.el = N.createElement(p, i), E.currentNode = this.el.content, t === 2 || t === 3) {
      const h = this.el.content.firstChild;
      h.replaceWith(...h.childNodes);
    }
    for (; (s = E.nextNode()) !== null && a.length < c; ) {
      if (s.nodeType === 1) {
        if (s.hasAttributes()) for (const h of s.getAttributeNames()) if (h.endsWith(Pe)) {
          const d = f[o++], g = s.getAttribute(h).split(x), y = /([.?@])?(.*)/.exec(d);
          a.push({ type: 1, index: n, name: y[2], strings: g, ctor: y[1] === "." ? lt : y[1] === "?" ? ht : y[1] === "@" ? dt : G }), s.removeAttribute(h);
        } else h.startsWith(x) && (a.push({ type: 6, index: n }), s.removeAttribute(h));
        if (Te.test(s.tagName)) {
          const h = s.textContent.split(x), d = h.length - 1;
          if (d > 0) {
            s.textContent = q ? q.emptyScript : "";
            for (let g = 0; g < d; g++) s.append(h[g], z()), E.nextNode(), a.push({ type: 2, index: ++n });
            s.append(h[d], z());
          }
        }
      } else if (s.nodeType === 8) if (s.data === Oe) a.push({ type: 2, index: n });
      else {
        let h = -1;
        for (; (h = s.data.indexOf(x, h + 1)) !== -1; ) a.push({ type: 7, index: n }), h += x.length - 1;
      }
      n++;
    }
  }
  static createElement(e, t) {
    const i = S.createElement("template");
    return i.innerHTML = e, i;
  }
}
function T(r, e, t = r, i) {
  if (e === O) return e;
  let s = i !== void 0 ? t._$Co?.[i] : t._$Cl;
  const n = M(e) ? void 0 : e._$litDirective$;
  return s?.constructor !== n && (s?._$AO?.(!1), n === void 0 ? s = void 0 : (s = new n(r), s._$AT(r, t, i)), i !== void 0 ? (t._$Co ??= [])[i] = s : t._$Cl = s), s !== void 0 && (e = T(r, s._$AS(r, e.values), s, i)), e;
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
    E.currentNode = s;
    let n = E.nextNode(), o = 0, c = 0, a = i[0];
    for (; a !== void 0; ) {
      if (o === a.index) {
        let p;
        a.type === 2 ? p = new U(n, n.nextSibling, this, e) : a.type === 1 ? p = new a.ctor(n, a.name, a.strings, this, e) : a.type === 6 && (p = new ut(n, this, e)), this._$AV.push(p), a = i[++c];
      }
      o !== a?.index && (n = E.nextNode(), o++);
    }
    return E.currentNode = S, s;
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
    this.type = 2, this._$AH = l, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = i, this.options = s, this._$Cv = s?.isConnected ?? !0;
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
    e = T(this, e, t), M(e) ? e === l || e == null || e === "" ? (this._$AH !== l && this._$AR(), this._$AH = l) : e !== this._$AH && e !== O && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : nt(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== l && M(this._$AH) ? this._$AA.nextSibling.data = e : this.T(S.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: t, _$litType$: i } = e, s = typeof i == "number" ? this._$AC(e) : (i.el === void 0 && (i.el = N.createElement(Ie(i.h, i.h[0]), this.options)), i);
    if (this._$AH?._$AD === s) this._$AH.p(t);
    else {
      const n = new ct(s, this), o = n.u(this.options);
      n.p(t), this.T(o), this._$AH = n;
    }
  }
  _$AC(e) {
    let t = we.get(e.strings);
    return t === void 0 && we.set(e.strings, t = new N(e)), t;
  }
  k(e) {
    ne(this._$AH) || (this._$AH = [], this._$AR());
    const t = this._$AH;
    let i, s = 0;
    for (const n of e) s === t.length ? t.push(i = new U(this.O(z()), this.O(z()), this, this.options)) : i = t[s], i._$AI(n), s++;
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
  constructor(e, t, i, s, n) {
    this.type = 1, this._$AH = l, this._$AN = void 0, this.element = e, this.name = t, this._$AM = s, this.options = n, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = l;
  }
  _$AI(e, t = this, i, s) {
    const n = this.strings;
    let o = !1;
    if (n === void 0) e = T(this, e, t, 0), o = !M(e) || e !== this._$AH && e !== O, o && (this._$AH = e);
    else {
      const c = e;
      let a, p;
      for (e = n[0], a = 0; a < n.length - 1; a++) p = T(this, c[i + a], t, a), p === O && (p = this._$AH[a]), o ||= !M(p) || p !== this._$AH[a], p === l ? e = l : e !== l && (e += (p ?? "") + n[a + 1]), this._$AH[a] = p;
    }
    o && !s && this.j(e);
  }
  j(e) {
    e === l ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class lt extends G {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === l ? void 0 : e;
  }
}
class ht extends G {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== l);
  }
}
class dt extends G {
  constructor(e, t, i, s, n) {
    super(e, t, i, s, n), this.type = 5;
  }
  _$AI(e, t = this) {
    if ((e = T(this, e, t, 0) ?? l) === O) return;
    const i = this._$AH, s = e === l && i !== l || e.capture !== i.capture || e.once !== i.once || e.passive !== i.passive, n = e !== l && (i === l || s);
    s && this.element.removeEventListener(this.name, this, i), n && this.element.addEventListener(this.name, this, e), this._$AH = e;
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
    T(this, e);
  }
}
const pt = re.litHtmlPolyfillSupport;
pt?.(N, U), (re.litHtmlVersions ??= []).push("3.3.3");
const ft = (r, e, t) => {
  const i = t?.renderBefore ?? e;
  let s = i._$litPart$;
  if (s === void 0) {
    const n = t?.renderBefore ?? null;
    i._$litPart$ = s = new U(e.insertBefore(z(), n), n, void 0, t ?? {});
  }
  return s._$AI(r), s;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const oe = globalThis;
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
    return O;
  }
}
C._$litElement$ = !0, C.finalized = !0, oe.litElementHydrateSupport?.({ LitElement: C });
const gt = oe.litElementPolyfillSupport;
gt?.({ LitElement: C });
(oe.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const mt = { attribute: !0, type: String, converter: B, reflect: !1, hasChanged: se }, vt = (r = mt, e, t) => {
  const { kind: i, metadata: s } = t;
  let n = globalThis.litPropertyMetadata.get(s);
  if (n === void 0 && globalThis.litPropertyMetadata.set(s, n = /* @__PURE__ */ new Map()), i === "setter" && ((r = Object.create(r)).wrapped = !0), n.set(t.name, r), i === "accessor") {
    const { name: o } = t;
    return { set(c) {
      const a = e.get.call(this);
      e.set.call(this, c), this.requestUpdate(o, a, r, !0, c);
    }, init(c) {
      return c !== void 0 && this.C(o, void 0, r, c), c;
    } };
  }
  if (i === "setter") {
    const { name: o } = t;
    return function(c) {
      const a = this[o];
      e.call(this, c), this.requestUpdate(o, a, r, !0, c);
    };
  }
  throw Error("Unsupported decorator location: " + i);
};
function L(r) {
  return (e, t) => typeof t == "object" ? vt(r, e, t) : ((i, s, n) => {
    const o = s.hasOwnProperty(n);
    return s.constructor.createProperty(n, i), o ? Object.getOwnPropertyDescriptor(s, n) : void 0;
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
`, _t = /* @__PURE__ */ new Set(["unavailable", "unknown"]), bt = /* @__PURE__ */ new Set([
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
  if (!e || !bt.has(e)) return !1;
  const t = Number(r.state);
  return Number.isFinite(t) && t < 0;
}
const wt = " · ";
function $t(r, e) {
  if (!(!r || !e || !e.stateObj || e.missing || e.unavailable) && !e.impossible)
    return r.formatEntityState(e.stateObj);
}
function xt(r) {
  return r.filter(
    (e) => !!e && (e.content !== void 0 || (e.text ?? "").trim() !== "")
  );
}
function At(r, e) {
  const t = $t(r, e);
  return t ? { text: t, entityId: e?.entityId } : void 0;
}
function kt(r, e) {
  if (!e) return { value: r };
  if (!r.endsWith(e)) return { value: r };
  const t = r.slice(0, r.length - e.length).trimEnd();
  return t ? { value: t, unit: e } : { value: r };
}
const $e = "unavailable", Et = "unknown", Ct = "off", St = /* @__PURE__ */ new Set(["button", "input_button", "scene"]), ze = (r) => r.substring(0, r.indexOf("."));
function Pt(r, e) {
  const t = ze(r.entity_id), i = r.state;
  if (St.has(t))
    return i !== $e;
  if (i === $e || i === Et || i === Ct && t !== "alert")
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
function k(r) {
  return r !== void 0 && r.action !== "none";
}
const Ot = ["closed", "locked", "off"], Tt = {
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
  const t = Tt[r];
  return t ? (e ? t.on : t.off) ?? t.on : e ? "turn_on" : "turn_off";
}
function Rt(r, e) {
  const t = r.states[e];
  if (!t) return;
  const i = ze(e), s = i === "group" ? "homeassistant" : i, n = Ot.includes(t.state);
  r.callService(s, It(i, n), {
    entity_id: e
  });
}
function xe(r, e, t) {
  r.dispatchEvent(
    new CustomEvent(e, { detail: t, bubbles: !0, composed: !0 })
  );
}
function zt(r, e) {
  e ? window.history.replaceState(null, "", r) : window.history.pushState(null, "", r), window.dispatchEvent(new CustomEvent("location-changed", { detail: {} }));
}
async function Mt(r, e) {
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
async function Nt(r, e, t, i) {
  let s;
  if (i === "double_tap" ? s = t.double_tap_action : i === "hold" ? s = t.hold_action : s = t.tap_action, s || (s = { action: "more-info" }), !!await Mt(r, s))
    switch (s.action) {
      case "none":
        break;
      case "more-info": {
        const n = s.entity || t.entity;
        n && xe(r, "hass-more-info", { entityId: n });
        break;
      }
      case "toggle": {
        const n = s.entity || t.entity;
        n && Rt(e, n);
        break;
      }
      case "navigate":
        s.navigation_path && zt(s.navigation_path, s.navigation_replace);
        break;
      case "url":
        s.url_path && window.open(s.url_path, "_blank", "noreferrer");
        break;
      case "perform-action":
      case "call-service": {
        const n = s.perform_action || s.service;
        if (!n) break;
        const [o, c] = n.split(".", 2);
        e.callService(o, c, {
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
const Me = 5e3, ke = [
  "ha-tile-container",
  "ha-tile-icon",
  "ha-tile-info",
  "hui-card-features"
];
let j, F;
function Ne(r, e) {
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
  return j || (j = (async () => ke.every((e) => customElements.get(e)) ? !0 : (await Lt(), (await Promise.all(
    ke.map((e) => Ne(e, Me))
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
    return Ne("hui-card-features-editor", Me);
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
function b(r, e, t = {}) {
  const i = Ue(), s = Ft, n = t.count, o = typeof n == "number" ? `${e}.${Wt(i, n)}` : void 0;
  return ((o && s[o]) ?? s[e] ?? e).replace(
    /\{(\w+)\}/g,
    (a, p) => p in t ? String(t[p]) : a
  );
}
var Bt = Object.defineProperty, ae = (r, e, t, i) => {
  for (var s = void 0, n = r.length - 1, o; n >= 0; n--)
    (o = r[n]) && (s = o(e, t, s) || s);
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
    Nt(this, this.hass, i, e);
  }
  // ---- rendering -------------------------------------------------------
  /** A banner instead of the card: the config is invalid or the entity is gone. */
  renderWarning(e) {
    return u`<ha-card><div class="warning">${e}</div></ha-card>`;
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
      content: u`<state-display
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
      return b(
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
    if (!t) return u`<span>${e}</span>`;
    const i = this.hass?.states[t]?.attributes.friendly_name ?? t;
    return u`<button
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
      secondary: n,
      mainEntityId: o,
      imageUrl: c,
      defaultIconAction: a,
      values: p,
      ownFeatures: f,
      customFeatures: h
    } = e;
    if (this._entityId = o, this._defaultIconAction = a, !this._ready)
      return this.renderWarning(b(this.hass, "internals.failed"));
    const d = this._tileColor(i), g = this.base.icon_tap_action ?? a, y = k(g) || k(this.base.icon_hold_action) || k(this.base.icon_double_tap_action), w = this.base.features ?? f, v = this.base.features_position ?? "bottom", m = this.base.levels === !1 ? void 0 : h, _ = Ae(w, v), he = typeof this.base.grid_options?.rows == "number";
    return this.toggleAttribute(
      "filled",
      he && !!(m || _.below.length)
    ), u`
      <ha-card style="--tile-color: ${d};">
        <ha-tile-container
          .featurePosition=${v}
          .vertical=${!!this.base.vertical}
          .fixedInfoHeight=${this.layout === "grid" && he}
          .interactive=${!0}
          .actionHandlerOptions=${{
      hasHold: k(this.base.hold_action),
      hasDoubleClick: k(this.base.double_tap_action)
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
      hasHold: k(this.base.icon_hold_action),
      hasDoubleClick: k(this.base.icon_double_tap_action)
    }}
            @action=${this._handleIconAction}
          ></ha-tile-icon>

          <div slot="info" class="info ${this.base.vertical ? "vertical" : ""}">
            <ha-tile-info>
              <span slot="primary">${s}</span>
              ${n?.length && !this.base.hide_state ? u`<span slot="secondary"
                    >${n.map(
      ($, J) => u`
                        ${J ? u`<span>${wt}</span>` : l}${this.renderClickable(
        $.content ?? $.text,
        $.entityId
      )}
                      `
    )}</span
                  >` : l}
            </ha-tile-info>
            ${p?.length ? u`<div class="values of-${p.length}">
                  ${p.map(
      ($, J) => u`
                      ${J ? u`<span class="values-separator">/</span>` : l}
                      ${this.renderClickable(
        u`${$.icon ? u`<ha-icon
                              class="value-icon"
                              .icon=${$.icon}
                            ></ha-icon>` : l}${$.value}${$.unit ? u`<span class="unit"> ${$.unit}</span>` : l}`,
        $.entityId
      )}
                    `
    )}
                </div>` : l}
          </div>

          ${_.inline.length ? u`<hui-card-features
                slot="features-inline"
                .hass=${this.hass}
                .context=${{ entity_id: o }}
                .color=${this.base.color}
                .features=${_.inline}
                .position=${v}
              ></hui-card-features>` : l}
          ${m ? u`<div slot="features" class="custom-features">
                ${m}
              </div>` : l}
          ${_.below.length ? u`<hui-card-features
                slot="features"
                .columns=${_.columns}
                .hass=${this.hass}
                .context=${{ entity_id: o }}
                .color=${this.base.color}
                .features=${_.below}
                .position=${"bottom"}
              ></hui-card-features>` : l}
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
    if (!(!this.hass || !e) && !_t.has(e.state) && !yt(e))
      return kt(
        this.hass.formatEntityState(e),
        e.attributes.unit_of_measurement
      );
  }
}
ae([
  L({ attribute: !1 })
], K.prototype, "hass");
ae([
  L({ attribute: !1 })
], K.prototype, "layout");
ae([
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
  return u`
    <div
      class="levels"
      style=${l}
    >
      ${r.map(
    (i) => u`
          <button
            class="level ${i.alarm ? "low" : ""}"
            style="--ink: ${i.ink};"
            title="${i.name}: ${i.text}"
            @click=${(s) => {
      s.stopPropagation(), e(i.entityId);
    }}
          >
            <span class="name">
              ${i.alarm ? u`<ha-icon
                    icon=${i.alarmIcon ?? "mdi:alert-circle"}
                  ></ha-icon>` : i.icon ? u`<ha-icon class="mark" icon=${i.icon}></ha-icon>` : l}${i.name}
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
let Ee = !1;
function Zt(r) {
  Ee || (Ee = !0, console.warn(
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
  for (var s = void 0, n = r.length - 1, o; n >= 0; n--)
    (o = r[n]) && (s = o(e, t, s) || s);
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
    let t = "idle", i = 0, s = null, n = null, o = null, c = null, a = !1, p = e.switch;
    const f = e.entity || e.switch;
    if (e.entity && this.hass.states[e.entity]) {
      const h = this.hass.states[e.entity];
      if (h) {
        t = h.state;
        const d = h.attributes;
        i = Number(d.power_w) || 0, s = d.connected_device ? String(d.connected_device) : null, n = d.battery_level !== void 0 && d.battery_level !== null ? Number(d.battery_level) : null, o = d.min_charge !== void 0 && d.min_charge !== null ? Number(d.min_charge) : null, c = d.max_charge !== void 0 && d.max_charge !== null ? Number(d.max_charge) : null, a = !!d.is_probing, !p && d.switch_entity && (p = String(d.switch_entity));
      }
    } else if (e.switch && this.hass.states[e.switch]) {
      const h = this.hass.states[e.switch], d = h ? h.state === "on" : !1;
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
      batteryLevel: n,
      minCharge: o,
      maxCharge: c,
      isProbing: a,
      switchEntity: p,
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
    if (!this._config || !this.hass) return l;
    const e = this._config, t = this._getChargerData();
    if (!t) return l;
    const {
      state: i,
      powerW: s,
      connectedDevice: n,
      batteryLevel: o,
      minCharge: c,
      maxCharge: a,
      isProbing: p,
      switchEntity: f,
      mainEntityId: h
    } = t;
    let d = "mdi:power-plug-outline", g = "var(--state-inactive-color, #7b7b7b)";
    i === "charging" ? (d = "mdi:battery-charging", g = "var(--success-color, #43a047)") : i === "manual_100" ? (d = "mdi:battery-charging-100", g = "var(--warning-color, #ffa600)") : i === "cooldown" || i === "sleep" ? (d = "mdi:battery-clock", g = "var(--info-color, #0288d1)") : i === "generic" && (d = "mdi:power-plug", g = "var(--accent-color, #7e57c2)");
    const y = b(this.hass, `charger.${i}`), w = [];
    p ? w.push(b(this.hass, "charger.probing")) : n ? (w.push(n), w.push(y)) : i !== "idle" ? w.push(y) : w.push(b(this.hass, "charger.idle"));
    const v = [];
    if (n && o !== null) {
      const _ = a ? `${Math.round(o)}% / ${a}%` : `${Math.round(o)}%`;
      v.push({
        entityId: h ?? "",
        name: n,
        text: _,
        ink: Le(o),
        level: o,
        icon: i === "charging" ? "mdi:battery-charging" : "mdi:battery",
        alarm: c !== null ? o < c : o < 20
      });
    }
    const m = u`
      ${v.length ? Gt(v, (_) => this.fireMoreInfo(_)) : l}
      <div class="quick-actions">
        <button
          class="action-chip ${i === "manual_100" ? "active" : ""}"
          @click=${this._handleForce100}
        >
          <ha-icon icon="mdi:battery-charging-100"></ha-icon>
          ${b(this.hass, "charger.force_100")}
        </button>
        ${i !== "idle" ? u`
              <button class="action-chip" @click=${this._handleStop}>
                <ha-icon icon="mdi:stop"></ha-icon>
                ${b(this.hass, "charger.stop")}
              </button>
            ` : l}
      </div>
    `;
    return this.renderTile({
      icon: d,
      color: g,
      primary: e.name ?? (f && this.hass.states[f]?.attributes.friendly_name) ?? b(this.hass, "charger.title"),
      mainEntityId: h,
      secondary: xt(
        w.map((_) => ({ text: _ }))
      ),
      values: [
        {
          value: `${s.toFixed(s >= 10 ? 0 : 1)} W`,
          icon: "mdi:flash",
          entityId: e.power ?? f
        },
        ...o !== null ? [
          {
            value: `${Math.round(o)}%`,
            icon: "mdi:battery",
            entityId: h
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
  for (var s = void 0, n = r.length - 1, o; n >= 0; n--)
    (o = r[n]) && (s = o(e, t, s) || s);
  return s && Yt(e, t, s), s;
};
class ce extends C {
  static {
    this.styles = H`
    :host {
      display: block;
      --ha-card-border-radius: var(--ha-border-radius-lg, 12px);
    }

    :host([filled]) {
      height: 100%;
    }

    ha-card {
      height: 100%;
      background: var(--ha-card-background, var(--card-background-color, white));
      border-radius: var(--ha-card-border-radius, var(--ha-border-radius-lg, 12px));
      box-shadow: var(--ha-card-box-shadow, none);
      border: var(--ha-card-border-width, 1px) solid
        var(--ha-card-border-color, var(--divider-color, #e0e0e0));
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      padding: 0;
    }

    .card-header {
      height: 56px;
      min-height: 56px;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 16px;
      border-bottom: 1px solid
        var(--divider-color, rgba(128, 128, 128, 0.12));
      background: transparent;
      flex-shrink: 0;
    }

    :host([filled]) .card-header {
      flex: 1 1 0;
      height: auto;
    }

    .header-icon {
      width: 36px;
      height: 36px;
      border-radius: var(--ha-border-radius-pill, 9999px);
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(
        --secondary-background-color,
        rgba(128, 128, 128, 0.1)
      );
      color: var(--primary-color);
      flex-shrink: 0;
    }

    .header-icon ha-icon {
      --mdc-icon-size: 20px;
    }

    .header-title {
      font-size: var(--ha-font-size-m, 16px);
      font-weight: 600;
      color: var(--primary-text-color);
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .header-badge {
      font-size: var(--ha-font-size-s, 12px);
      color: var(--secondary-text-color);
      background: var(
        --secondary-background-color,
        rgba(128, 128, 128, 0.1)
      );
      padding: 3px 10px;
      border-radius: var(--ha-border-radius-pill, 9999px);
      font-weight: 500;
      flex-shrink: 0;
    }

    .chargers-list {
      display: contents;
    }

    .charger-item {
      height: 56px;
      min-height: 56px;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 16px;
      cursor: pointer;
      transition: background-color 0.2s ease;
      background: transparent;
      flex-shrink: 0;
    }

    :host([filled]) .charger-item {
      flex: 1 1 0;
      height: auto;
    }

    .charger-item:hover {
      background: var(--state-hover-color, rgba(128, 128, 128, 0.05));
    }

    .charger-item:not(:last-child) {
      border-bottom: 1px solid
        var(--divider-color, rgba(128, 128, 128, 0.08));
    }

    .socket-icon {
      width: 36px;
      height: 36px;
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
      justify-content: center;
      gap: 2px;
    }

    .primary-line {
      display: flex;
      align-items: center;
      gap: 8px;
      white-space: nowrap;
      overflow: hidden;
      line-height: 18px;
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
      line-height: 14px;
      padding: 1px 6px;
      border-radius: 6px;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 3px;
      max-width: 140px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex-shrink: 0;
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
      gap: 5px;
      font-size: var(--ha-font-size-s, 12px);
      line-height: 16px;
      color: var(--secondary-text-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .state-text {
      flex-shrink: 0;
    }

    .dot-sep {
      opacity: 0.5;
      flex-shrink: 0;
    }

    .power-val {
      font-weight: 600;
      color: var(--primary-text-color);
      font-variant-numeric: tabular-nums;
      flex-shrink: 0;
    }

    .inline-battery {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      flex-shrink: 0;
    }

    .inline-battery-bar {
      position: relative;
      display: inline-block;
      width: 42px;
      height: 6px;
      background: var(--divider-color, rgba(128, 128, 128, 0.2));
      border-radius: 9999px;
      overflow: visible;
      vertical-align: middle;
    }

    .inline-battery-fill {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      border-radius: 9999px;
      transition: width 0.3s ease;
    }

    .inline-battery-limit {
      position: absolute;
      top: -2px;
      bottom: -2px;
      width: 2px;
      background: var(--primary-text-color);
      opacity: 0.8;
      border-radius: 1px;
      z-index: 1;
    }

    .inline-battery-text {
      font-size: 11px;
      font-weight: 500;
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
      padding: 2px 7px;
      font-size: 11px;
      font-weight: 600;
      border-radius: 10px;
      border: 1px solid var(--divider-color, rgba(128, 128, 128, 0.25));
      background: var(--card-background-color, white);
      color: var(--primary-text-color);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-100:hover,
    .btn-100.active {
      background: var(--warning-color, #ffa600);
      color: white;
      border-color: transparent;
    }

    .empty-state {
      height: 56px;
      min-height: 56px;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--secondary-text-color);
      font-size: var(--ha-font-size-s, 13px);
    }

    :host([filled]) .empty-state {
      flex: 1 1 0;
      height: auto;
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
  _chargerCount() {
    if (this._config?.chargers && this._config.chargers.length > 0)
      return this._config.chargers.length;
    const e = this._resolveChargers();
    return e.length > 0 ? e.length : 1;
  }
  getCardSize() {
    return 1 + this._chargerCount();
  }
  getGridOptions() {
    const e = 1 + this._chargerCount();
    return {
      columns: 12,
      rows: this._config?.grid_options?.rows ?? e,
      min_rows: e,
      min_columns: 6
    };
  }
  _resolveChargers() {
    if (!this.hass) return [];
    const e = this._config, t = [];
    if (e?.chargers && e.chargers.length > 0) {
      for (const n of e.chargers) {
        const o = typeof n == "string" ? { switch: n } : n;
        let c = o.entity ?? null;
        const a = o.switch ?? null, p = o.power ?? null, f = o.name;
        if (!c && a) {
          const d = Object.keys(this.hass.states).find(
            (g) => g.startsWith("sensor.") && this.hass.states[g]?.attributes.switch_entity === a
          );
          d && (c = d);
        }
        const h = this._buildResolved(
          c,
          a,
          p,
          f,
          o.device_name
        );
        h && t.push(h);
      }
      return t;
    }
    const i = Object.keys(this.hass.states).filter(
      (n) => n.startsWith("sensor.") && this.hass.states[n]?.attributes.charger_id !== void 0
    );
    if (i.length > 0) {
      for (const n of i) {
        const o = this._buildResolved(n, null, null, void 0, void 0);
        o && t.push(o);
      }
      return t;
    }
    const s = Object.keys(this.hass.states).filter(
      (n) => n.startsWith("switch.") && (n.includes("plug") || n.includes("charger") || n.includes("socket"))
    );
    for (const n of s) {
      const o = Object.keys(this.hass.states).find(
        (a) => a.startsWith("sensor.") && (a.includes(n.replace("switch.", "")) || a.includes(n.replace("switch.device_plug_", ""))) && a.endsWith("_power")
      ), c = this._buildResolved(null, n, o ?? null, void 0, void 0);
      c && t.push(c);
    }
    return t;
  }
  _buildResolved(e, t, i, s, n) {
    if (!this.hass) return null;
    let o = "idle", c = 0, a = n ?? null, p = null, f = null, h = null, d = !1, g = !1, y = s;
    if (e && this.hass.states[e]) {
      const v = this.hass.states[e];
      if (v) {
        o = v.state;
        const m = v.attributes;
        c = Number(m.power_w) || 0, a = m.connected_device ? String(m.connected_device) : a, p = m.battery_level !== void 0 && m.battery_level !== null ? Number(m.battery_level) : null, f = m.min_charge !== void 0 && m.min_charge !== null ? Number(m.min_charge) : null, h = m.max_charge !== void 0 && m.max_charge !== null ? Number(m.max_charge) : null, d = !!m.is_probing, !t && m.switch_entity && (t = String(m.switch_entity)), !y && m.charger_name && (y = String(m.charger_name));
      }
    }
    if (t && this.hass.states[t]) {
      const v = this.hass.states[t];
      if (v && (g = v.state === "on", y || (y = v.attributes.friendly_name ?? t)), !i && e === null) {
        const m = Object.keys(this.hass.states).find(
          (_) => _.startsWith("sensor.") && _.includes(t.replace("switch.", "")) && _.endsWith("_power")
        );
        m && (i = m);
      }
    }
    if (i && this.hass.states[i] && e === null) {
      const v = this.hass.states[i];
      c = v && parseFloat(v.state) || 0, o = g ? c > 2.5 ? "charging" : "generic" : "idle";
    }
    const w = e ?? t ?? "unknown";
    return {
      id: w,
      name: y ?? w,
      state: o,
      powerW: c,
      connectedDevice: a,
      batteryLevel: p,
      minCharge: f,
      maxCharge: h,
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
    if (!this.hass) return l;
    const e = this._resolveChargers(), t = this._config?.title ?? b(this.hass, "charger.title"), i = e.filter(
      (s) => s.state === "charging" || s.state === "manual_100"
    ).length;
    return u`
      <ha-card>
        <div class="card-header">
          <div class="header-icon">
            <ha-icon icon="mdi:battery-charging-wireless"></ha-icon>
          </div>
          <div class="header-title">${t}</div>
          <div class="header-badge">
            ${i > 0 ? `${i} / ${e.length}` : b(this.hass, "charger.idle")}
          </div>
        </div>

        ${e.length ? u`
              <div class="chargers-list">
                ${e.map((s) => this._renderChargerRow(s))}
              </div>
            ` : u`<div class="empty-state">${b(this.hass, "charger.noChargers")}</div>`}
      </ha-card>
    `;
  }
  _renderChargerRow(e) {
    let t = "mdi:power-plug-outline", i = "var(--secondary-text-color)", s = "rgba(128, 128, 128, 0.1)";
    e.state === "charging" ? (t = "mdi:battery-charging", i = "var(--success-color, #43a047)", s = "rgba(67, 160, 71, 0.15)") : e.state === "manual_100" ? (t = "mdi:battery-charging-100", i = "var(--warning-color, #ffa600)", s = "rgba(255, 166, 0, 0.15)") : e.state === "cooldown" || e.state === "sleep" ? (t = "mdi:battery-clock", i = "var(--info-color, #0288d1)", s = "rgba(2, 136, 209, 0.15)") : e.state === "generic" && (t = "mdi:power-plug", i = "var(--accent-color, #7e57c2)", s = "rgba(126, 87, 194, 0.15)");
    const n = e.isProbing ? b(this.hass, "charger.probing") : b(this.hass, `charger.${e.state}`);
    let o = "mdi:cellphone";
    e.connectedDevice?.toLowerCase().includes("watch") ? o = "mdi:watch" : e.connectedDevice?.toLowerCase().includes("tablet") && (o = "mdi:tablet");
    const c = e.statusEntity ?? e.switchEntity;
    return u`
      <div
        class="charger-item"
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
            ${e.connectedDevice ? u`
                  <span class="device-pill ${e.state}">
                    <ha-icon icon=${o} style="--mdc-icon-size: 13px;"></ha-icon>
                    ${e.connectedDevice}
                  </span>
                ` : e.state === "generic" ? u`
                  <span class="device-pill generic">
                    ${b(this.hass, "charger.generic")}
                  </span>
                ` : u`
                  <span class="device-pill idle">
                    ${b(this.hass, "charger.idle")}
                  </span>
                `}
          </div>
          <div class="secondary-line">
            <span class="state-text">${n}</span>
            ${e.isSwitchOn ? u`
                  <span class="dot-sep">·</span>
                  <span class="power-val">${e.powerW.toFixed(e.powerW >= 10 ? 0 : 1)} W</span>
                ` : l}
            ${e.batteryLevel !== null ? u`
                  <span class="dot-sep">·</span>
                  <span class="inline-battery">
                    <span class="inline-battery-bar">
                      <span
                        class="inline-battery-fill"
                        style="width: ${e.batteryLevel}%; background-color: ${Le(e.batteryLevel)};"
                      ></span>
                      ${e.maxCharge ? u`
                            <span
                              class="inline-battery-limit"
                              style="left: ${e.maxCharge}%;"
                              title="Target limit: ${e.maxCharge}%"
                            ></span>
                          ` : l}
                    </span>
                    <span class="inline-battery-text">
                      ${Math.round(e.batteryLevel)}%${e.maxCharge ? ` / ${e.maxCharge}%` : ""}
                    </span>
                  </span>
                ` : l}
          </div>
        </div>

        <div class="row-actions">
          ${e.isSwitchOn ? u`
                <button
                  class="btn-100 ${e.state === "manual_100" ? "active" : ""}"
                  title="${b(this.hass, "charger.force_100")}"
                  @click=${(a) => this._handleForce100(a, e)}
                >
                  100%
                </button>
              ` : l}
          ${e.switchEntity ? u`
                <ha-switch
                  .checked=${e.isSwitchOn}
                  @click=${(a) => a.stopPropagation()}
                  @change=${(a) => this._handleToggleSocket(a, e)}
                ></ha-switch>
              ` : l}
        </div>
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
  for (var s = void 0, n = r.length - 1, o; n >= 0; n--)
    (o = r[n]) && (s = o(e, t, s) || s);
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
    return !this.hass || !this._config ? l : u`
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
            const n = [...i];
            n[t] = s, this.dispatchEvent(
              new CustomEvent("config-changed", {
                detail: { config: { ...this._config, features: n } },
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
    if (!e) return l;
    const t = this._config?.features ?? this.defaultFeatures(), i = qe, s = {
      bottom: "Bottom",
      bottom_description: "Displays all features stacked",
      inline: "Inline",
      inline_description: "Displays features in two columns, starting next to the name",
      helper_vertical: "Always displayed at the bottom if the content layout is vertical"
    }, n = (a, p) => this.hass?.localize(`ui.panel.lovelace.editor.card.tile.${a}`) || p, o = !!this._config?.vertical, c = {
      ...this._config,
      features_position: o ? "bottom" : this._config?.features_position ?? "bottom"
    };
    return u`
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
          ${t.length ? u`
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
              (a) => ({
                value: a,
                label: n(
                  `features_position_options.${a}`,
                  s[a]
                ),
                description: n(
                  `features_position_options.${a}_description`,
                  s[`${a}_description`]
                ),
                image: {
                  src: `/static/images/form/tile_features_position_${a}.svg`,
                  src_dark: `/static/images/form/tile_features_position_${a}_dark.svg`,
                  flip_rtl: !0
                },
                disabled: o && a === "inline"
              })
            )
          }
        }
      }
    ]}
                  .computeLabel=${this._computeLabel}
                  .computeHelper=${() => o ? n(
      "features_position_helper_vertical",
      s.helper_vertical
    ) : void 0}
                  @value-changed=${this._valueChanged}
                ></ha-form>
              ` : l}
        </div>
      </ha-expansion-panel>
    `;
  }
  render() {
    return !this.hass || !this._config ? l : u`
      ${this.renderForm()}
      ${this._featuresEditorReady ? this._renderFeatures() : l}
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
