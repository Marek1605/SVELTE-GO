import{s as cl,n as Kt,d as u,r as vl,a as ge,l as dt,i as st,b as e,v as nt,m as o,c as r,e as p,g as k,q as P,f as l,h as i,j as g,t as n,T as Qt,k as dl,p as ul,y as fl}from"../chunks/DGgboO4P.js";import{e as el}from"../chunks/C_DwOGRg.js";import{S as _l,i as hl}from"../chunks/CbG7B7V5.js";function tl(d,a,c){const v=d.slice();return v[26]=a[c],v}function ll(d){let a,c;return{c(){a=i("div"),c=n(d[3]),this.h()},l(v){a=r(v,"DIV",{class:!0});var b=p(a);c=l(b,d[3]),b.forEach(u),this.h()},h(){o(a,"class","conv-toast svelte-f64zlz")},m(v,b){st(v,a,b),e(a,c)},p(v,b){b&8&&ge(c,v[3])},d(v){v&&u(a)}}}function nl(d){let a,c,v,b="Tracking skript pre Thank You stránku",V,_,L="📋 Kopírovať kód",f,t,T,m="{",O,y,A="{",R,N,E,$,B,j,X="}",q,U,Q="{",J,w,M,z="[email protected]",I,x="}",ae,Z,ee="{",G,F,oe="{",le,fe,_e="{",te,W,ne="}",C,Be,xe="{",re,he,He="}",Ce,Oe,Ke="}",pe,Ue,$e="}",ie,me,Je="}",je,S,be,Re;return{c(){a=i("div"),c=i("div"),v=i("span"),v.textContent=b,V=g(),_=i("button"),_.textContent=L,f=g(),t=i("pre"),T=n(`<!-- MegaBuy.sk Conversion Tracking -->
<script>
(function() `),O=n(m),y=n(`
    var config = `),R=n(A),N=n(`
        trackingCode: '`),E=n(d[6]),$=n(`',
        trackingUrl: '`),B=n(d[5]),j=n(`'
    `),q=n(X),U=n(`;

    // ⚠️ DÔLEŽITÉ: Nahraďte tieto hodnoty skutočnými dátami z objednávky
    var orderData = `),J=n(Q),w=n(`
        order_id: 'ORDER-12345',           // ID vašej objednávky
        customer_email: '`),M=i("a"),M.textContent=z,I=n(`',
        customer_name: 'Ján Novák',
        order_value: 49.99                  // Celková suma objednávky v EUR
    `),ae=n(x),Z=n(`;

    if (orderData.order_id && orderData.customer_email) `),G=n(ee),F=n(`
        fetch(config.trackingUrl, `),le=n(oe),fe=n(`
            method: 'POST',
            headers: `),te=n(_e),W=n(" 'Content-Type': 'application/json' "),C=n(ne),Be=n(`,
            body: JSON.stringify(`),re=n(xe),he=n(`
                tracking_code: config.trackingCode,
                ...orderData
            `),Ce=n(He),Oe=n(`)
        `),pe=n(Ke),Ue=n(`).then(r => r.json())
          .then(d => console.log('MegaBuy: Conversion tracked', d))
          .catch(e => console.error('MegaBuy: Error', e));
    `),ie=n($e),me=n(`
`),je=n(Je),S=n(`)();
<\/script>`),this.h()},l(ce){a=r(ce,"DIV",{class:!0});var Y=p(a);c=r(Y,"DIV",{class:!0});var se=p(c);v=r(se,"SPAN",{"data-svelte-h":!0}),P(v)!=="svelte-176l7do"&&(v.textContent=b),V=k(se),_=r(se,"BUTTON",{class:!0,"data-svelte-h":!0}),P(_)!=="svelte-ered5w"&&(_.textContent=L),se.forEach(u),f=k(Y),t=r(Y,"PRE",{id:!0,class:!0});var h=p(t);T=l(h,`<!-- MegaBuy.sk Conversion Tracking -->
<script>
(function() `),O=l(h,m),y=l(h,`
    var config = `),R=l(h,A),N=l(h,`
        trackingCode: '`),E=l(h,d[6]),$=l(h,`',
        trackingUrl: '`),B=l(h,d[5]),j=l(h,`'
    `),q=l(h,X),U=l(h,`;

    // ⚠️ DÔLEŽITÉ: Nahraďte tieto hodnoty skutočnými dátami z objednávky
    var orderData = `),J=l(h,Q),w=l(h,`
        order_id: 'ORDER-12345',           // ID vašej objednávky
        customer_email: '`),M=r(h,"A",{href:!0,class:!0,"data-cfemail":!0,"data-svelte-h":!0}),P(M)!=="svelte-1l7k5u"&&(M.textContent=z),I=l(h,`',
        customer_name: 'Ján Novák',
        order_value: 49.99                  // Celková suma objednávky v EUR
    `),ae=l(h,x),Z=l(h,`;

    if (orderData.order_id && orderData.customer_email) `),G=l(h,ee),F=l(h,`
        fetch(config.trackingUrl, `),le=l(h,oe),fe=l(h,`
            method: 'POST',
            headers: `),te=l(h,_e),W=l(h," 'Content-Type': 'application/json' "),C=l(h,ne),Be=l(h,`,
            body: JSON.stringify(`),re=l(h,xe),he=l(h,`
                tracking_code: config.trackingCode,
                ...orderData
            `),Ce=l(h,He),Oe=l(h,`)
        `),pe=l(h,Ke),Ue=l(h,`).then(r => r.json())
          .then(d => console.log('MegaBuy: Conversion tracked', d))
          .catch(e => console.error('MegaBuy: Error', e));
    `),ie=l(h,$e),me=l(h,`
`),je=l(h,Je),S=l(h,`)();
<\/script>`),h.forEach(u),Y.forEach(u),this.h()},h(){o(_,"class","conv-copy-btn conv-copy-btn-light svelte-f64zlz"),o(c,"class","conv-code-header svelte-f64zlz"),o(M,"href","/cdn-cgi/l/email-protection"),o(M,"class","__cf_email__"),o(M,"data-cfemail","b8c2d9d3d9c2d6d1d3f8ddd5d9d1d496cbd3"),o(t,"id","code-html"),o(t,"class","conv-code svelte-f64zlz"),o(a,"class","conv-code-section svelte-f64zlz")},m(ce,Y){st(ce,a,Y),e(a,c),e(c,v),e(c,V),e(c,_),e(a,f),e(a,t),e(t,T),e(t,O),e(t,y),e(t,R),e(t,N),e(t,E),e(t,$),e(t,B),e(t,j),e(t,q),e(t,U),e(t,J),e(t,w),e(t,M),e(t,I),e(t,ae),e(t,Z),e(t,G),e(t,F),e(t,le),e(t,fe),e(t,te),e(t,W),e(t,C),e(t,Be),e(t,re),e(t,he),e(t,Ce),e(t,Oe),e(t,pe),e(t,Ue),e(t,ie),e(t,me),e(t,je),e(t,S),be||(Re=nt(_,"click",d[18]),be=!0)},p(ce,Y){Y&64&&ge(E,ce[6]),Y&32&&ge(B,ce[5])},d(ce){ce&&u(a),be=!1,Re()}}}function al(d){let a,c,v,b="Pridajte do functions.php vašej témy",V,_,L="📋 Kopírovať kód",f,t,T,m="{",O,y,A,R,N,E,$="{",B,j,X="{",q,U,Q="}",J,w,M="{",z,I,x="}",ae,Z,ee="}",G,F,oe="}",le,fe,_e;return{c(){a=i("div"),c=i("div"),v=i("span"),v.textContent=b,V=g(),_=i("button"),_.textContent=L,f=g(),t=i("pre"),T=n(`<?php
// MegaBuy.sk Conversion Tracking pre WooCommerce
add_action('woocommerce_thankyou', 'megabuy_track_conversion', 10, 1);
function megabuy_track_conversion($order_id) `),O=n(m),y=n(`
    if (!$order_id) return;
    
    $order = wc_get_order($order_id);
    if (!$order) return;
    
    $tracking_code = '`),A=n(d[6]),R=n(`';
    $tracking_url = '`),N=n(d[5]),E=n(`';
    ?>
    <script>
    fetch('<?php echo $tracking_url; ?>', `),B=n($),j=n(`
        method: 'POST',
        headers: `),q=n(X),U=n(" 'Content-Type': 'application/json' "),J=n(Q),w=n(`,
        body: JSON.stringify(`),z=n(M),I=n(`
            tracking_code: '<?php echo $tracking_code; ?>',
            order_id: '<?php echo $order->get_order_number(); ?>',
            customer_email: '<?php echo $order->get_billing_email(); ?>',
            customer_name: '<?php echo $order->get_billing_first_name() . " " . $order->get_billing_last_name(); ?>',
            order_value: <?php echo $order->get_total(); ?>
        `),ae=n(x),Z=n(`)
    `),G=n(ee),F=n(`);
    <\/script>
    <?php
`),le=n(oe),this.h()},l(te){a=r(te,"DIV",{class:!0});var W=p(a);c=r(W,"DIV",{class:!0});var ne=p(c);v=r(ne,"SPAN",{"data-svelte-h":!0}),P(v)!=="svelte-1jxeu93"&&(v.textContent=b),V=k(ne),_=r(ne,"BUTTON",{class:!0,"data-svelte-h":!0}),P(_)!=="svelte-m1iuc2"&&(_.textContent=L),ne.forEach(u),f=k(W),t=r(W,"PRE",{id:!0,class:!0});var C=p(t);T=l(C,`<?php
// MegaBuy.sk Conversion Tracking pre WooCommerce
add_action('woocommerce_thankyou', 'megabuy_track_conversion', 10, 1);
function megabuy_track_conversion($order_id) `),O=l(C,m),y=l(C,`
    if (!$order_id) return;
    
    $order = wc_get_order($order_id);
    if (!$order) return;
    
    $tracking_code = '`),A=l(C,d[6]),R=l(C,`';
    $tracking_url = '`),N=l(C,d[5]),E=l(C,`';
    ?>
    <script>
    fetch('<?php echo $tracking_url; ?>', `),B=l(C,$),j=l(C,`
        method: 'POST',
        headers: `),q=l(C,X),U=l(C," 'Content-Type': 'application/json' "),J=l(C,Q),w=l(C,`,
        body: JSON.stringify(`),z=l(C,M),I=l(C,`
            tracking_code: '<?php echo $tracking_code; ?>',
            order_id: '<?php echo $order->get_order_number(); ?>',
            customer_email: '<?php echo $order->get_billing_email(); ?>',
            customer_name: '<?php echo $order->get_billing_first_name() . " " . $order->get_billing_last_name(); ?>',
            order_value: <?php echo $order->get_total(); ?>
        `),ae=l(C,x),Z=l(C,`)
    `),G=l(C,ee),F=l(C,`);
    <\/script>
    <?php
`),le=l(C,oe),C.forEach(u),W.forEach(u),this.h()},h(){o(_,"class","conv-copy-btn conv-copy-btn-light svelte-f64zlz"),o(c,"class","conv-code-header svelte-f64zlz"),o(t,"id","code-woo"),o(t,"class","conv-code svelte-f64zlz"),o(a,"class","conv-code-section svelte-f64zlz")},m(te,W){st(te,a,W),e(a,c),e(c,v),e(c,V),e(c,_),e(a,f),e(a,t),e(t,T),e(t,O),e(t,y),e(t,A),e(t,R),e(t,N),e(t,E),e(t,B),e(t,j),e(t,q),e(t,U),e(t,J),e(t,w),e(t,z),e(t,I),e(t,ae),e(t,Z),e(t,G),e(t,F),e(t,le),fe||(_e=nt(_,"click",d[19]),fe=!0)},p(te,W){W&64&&ge(A,te[6]),W&32&&ge(N,te[5])},d(te){te&&u(a),fe=!1,_e()}}}function sl(d){let a,c,v,b='Pre Shoptet - vložte do "Vlastný kód na ďakovnej stránke"',V,_,L="📋 Kopírovať kód",f,t,T,m="{",O,y,A="{",R,N,E,$,B,j,X="}",q,U,Q="{",J,w,M="{",z,I,x="}",ae,Z,ee="{",G,F,oe="}",le,fe,_e="{",te,W,ne="}",C,Be,xe="{",re,he,He="}",Ce,Oe,Ke="}",pe,Ue,$e="{",ie,me,Je="{",je,S,be="{",Re,ce,Y="}",se,h,ot="{",Ge,Te,ye="}",Xe,De,rt="}",We,Ee,qe="}",Qe,Ze,we="}",ze,Fe,Ie,ke,at=`<strong>📍 Kde nájsť v Shoptete:</strong><br/>
                        Nastavenia → Nastavenia eshopu → Vzhľad a obsah → Vlastný kód → Thank you stránka`,ve,Ve;return{c(){a=i("div"),c=i("div"),v=i("span"),v.textContent=b,V=g(),_=i("button"),_.textContent=L,f=g(),t=i("pre"),T=n(`<!-- MegaBuy.sk Conversion Tracking pre Shoptet -->
<script>
(function() `),O=n(m),y=n(`
    var config = `),R=n(A),N=n(`
        trackingCode: '`),E=n(d[6]),$=n(`',
        trackingUrl: '`),B=n(d[5]),j=n(`'
    `),q=n(X),U=n(`;

    // Shoptet premenné - automaticky nahradené systémom
    var orderData = `),J=n(Q),w=n(`
        order_id: '`),z=n(M),I=n("orderCode"),ae=n(x),Z=n(`',
        customer_email: '`),G=n(ee),F=n("customerEmail"),le=n(oe),fe=n(`',
        customer_name: '`),te=n(_e),W=n("customerName"),C=n(ne),Be=n(`',
        order_value: parseFloat('`),re=n(xe),he=n("orderPriceWithVat"),Ce=n(He),Oe=n(`'.replace(',', '.'))
    `),pe=n(Ke),Ue=n(`;

    if (orderData.order_id && orderData.customer_email) `),ie=n($e),me=n(`
        fetch(config.trackingUrl, `),je=n(Je),S=n(`
            method: 'POST',
            headers: `),Re=n(be),ce=n(" 'Content-Type': 'application/json' "),se=n(Y),h=n(`,
            body: JSON.stringify(`),Ge=n(ot),Te=n(`
                tracking_code: config.trackingCode,
                ...orderData
            `),Xe=n(ye),De=n(`)
        `),We=n(rt),Ee=n(`);
    `),Qe=n(qe),Ze=n(`
`),ze=n(we),Fe=n(`)();
<\/script>`),Ie=g(),ke=i("div"),ke.innerHTML=at,this.h()},l(de){a=r(de,"DIV",{class:!0});var K=p(a);c=r(K,"DIV",{class:!0});var ue=p(c);v=r(ue,"SPAN",{"data-svelte-h":!0}),P(v)!=="svelte-1litlh7"&&(v.textContent=b),V=k(ue),_=r(ue,"BUTTON",{class:!0,"data-svelte-h":!0}),P(_)!=="svelte-12btvj8"&&(_.textContent=L),ue.forEach(u),f=k(K),t=r(K,"PRE",{id:!0,class:!0});var s=p(t);T=l(s,`<!-- MegaBuy.sk Conversion Tracking pre Shoptet -->
<script>
(function() `),O=l(s,m),y=l(s,`
    var config = `),R=l(s,A),N=l(s,`
        trackingCode: '`),E=l(s,d[6]),$=l(s,`',
        trackingUrl: '`),B=l(s,d[5]),j=l(s,`'
    `),q=l(s,X),U=l(s,`;

    // Shoptet premenné - automaticky nahradené systémom
    var orderData = `),J=l(s,Q),w=l(s,`
        order_id: '`),z=l(s,M),I=l(s,"orderCode"),ae=l(s,x),Z=l(s,`',
        customer_email: '`),G=l(s,ee),F=l(s,"customerEmail"),le=l(s,oe),fe=l(s,`',
        customer_name: '`),te=l(s,_e),W=l(s,"customerName"),C=l(s,ne),Be=l(s,`',
        order_value: parseFloat('`),re=l(s,xe),he=l(s,"orderPriceWithVat"),Ce=l(s,He),Oe=l(s,`'.replace(',', '.'))
    `),pe=l(s,Ke),Ue=l(s,`;

    if (orderData.order_id && orderData.customer_email) `),ie=l(s,$e),me=l(s,`
        fetch(config.trackingUrl, `),je=l(s,Je),S=l(s,`
            method: 'POST',
            headers: `),Re=l(s,be),ce=l(s," 'Content-Type': 'application/json' "),se=l(s,Y),h=l(s,`,
            body: JSON.stringify(`),Ge=l(s,ot),Te=l(s,`
                tracking_code: config.trackingCode,
                ...orderData
            `),Xe=l(s,ye),De=l(s,`)
        `),We=l(s,rt),Ee=l(s,`);
    `),Qe=l(s,qe),Ze=l(s,`
`),ze=l(s,we),Fe=l(s,`)();
<\/script>`),s.forEach(u),Ie=k(K),ke=r(K,"DIV",{class:!0,"data-svelte-h":!0}),P(ke)!=="svelte-y8lj0f"&&(ke.innerHTML=at),K.forEach(u),this.h()},h(){o(_,"class","conv-copy-btn conv-copy-btn-light svelte-f64zlz"),o(c,"class","conv-code-header svelte-f64zlz"),o(t,"id","code-shoptet"),o(t,"class","conv-code svelte-f64zlz"),o(ke,"class","conv-note conv-note-info svelte-f64zlz"),o(a,"class","conv-code-section svelte-f64zlz")},m(de,K){st(de,a,K),e(a,c),e(c,v),e(c,V),e(c,_),e(a,f),e(a,t),e(t,T),e(t,O),e(t,y),e(t,R),e(t,N),e(t,E),e(t,$),e(t,B),e(t,j),e(t,q),e(t,U),e(t,J),e(t,w),e(t,z),e(t,I),e(t,ae),e(t,Z),e(t,G),e(t,F),e(t,le),e(t,fe),e(t,te),e(t,W),e(t,C),e(t,Be),e(t,re),e(t,he),e(t,Ce),e(t,Oe),e(t,pe),e(t,Ue),e(t,ie),e(t,me),e(t,je),e(t,S),e(t,Re),e(t,ce),e(t,se),e(t,h),e(t,Ge),e(t,Te),e(t,Xe),e(t,De),e(t,We),e(t,Ee),e(t,Qe),e(t,Ze),e(t,ze),e(t,Fe),e(a,Ie),e(a,ke),ve||(Ve=nt(_,"click",d[20]),ve=!0)},p(de,K){K&64&&ge(E,de[6]),K&32&&ge(B,de[5])},d(de){de&&u(a),ve=!1,Ve()}}}function ol(d){let a,c,v,b="Google Tag Manager - Custom HTML Tag",V,_,L="📋 Kopírovať kód",f,t,T,m="{",O,y,A="{",R,N,E,$,B,j,X="}",q,U,Q="{",J,w,M="{",z,I,x="}",ae,Z,ee="{",G,F,oe="}",le,fe,_e="{",te,W,ne="}",C,Be,xe="{",re,he,He="}",Ce,Oe,Ke="}",pe,Ue,$e="{",ie,me,Je="{",je,S,be="{",Re,ce,Y="}",se,h,ot="{",Ge,Te,ye="}",Xe,De,rt="}",We,Ee,qe="}",Qe,Ze,we="}",ze,Fe,Ie,ke,at=`<strong>⚙️ Nastavenie triggeru:</strong><br/>
                        Vytvorte trigger typu &quot;Page View&quot; s podmienkou: Page Path contains &quot;thank&quot; alebo &quot;dakujeme&quot;`,ve,Ve;return{c(){a=i("div"),c=i("div"),v=i("span"),v.textContent=b,V=g(),_=i("button"),_.textContent=L,f=g(),t=i("pre"),T=n(`<script>
// MegaBuy.sk Conversion Tracking - GTM
(function() `),O=n(m),y=n(`
    var config = `),R=n(A),N=n(`
        trackingCode: '`),E=n(d[6]),$=n(`',
        trackingUrl: '`),B=n(d[5]),j=n(`'
    `),q=n(X),U=n(`;

    // Použite dataLayer premenné z vášho GTM
    var orderData = `),J=n(Q),w=n(`
        order_id: `),z=n(M),I=n("transactionId"),ae=n(x),Z=n(`,
        customer_email: `),G=n(ee),F=n("customerEmail"),le=n(oe),fe=n(`,
        customer_name: `),te=n(_e),W=n("customerName"),C=n(ne),Be=n(`,
        order_value: `),re=n(xe),he=n("transactionTotal"),Ce=n(He),Oe=n(`
    `),pe=n(Ke),Ue=n(`;

    if (orderData.order_id && orderData.customer_email) `),ie=n($e),me=n(`
        fetch(config.trackingUrl, `),je=n(Je),S=n(`
            method: 'POST',
            headers: `),Re=n(be),ce=n(" 'Content-Type': 'application/json' "),se=n(Y),h=n(`,
            body: JSON.stringify(`),Ge=n(ot),Te=n(`
                tracking_code: config.trackingCode,
                ...orderData
            `),Xe=n(ye),De=n(`)
        `),We=n(rt),Ee=n(`);
    `),Qe=n(qe),Ze=n(`
`),ze=n(we),Fe=n(`)();
<\/script>`),Ie=g(),ke=i("div"),ke.innerHTML=at,this.h()},l(de){a=r(de,"DIV",{class:!0});var K=p(a);c=r(K,"DIV",{class:!0});var ue=p(c);v=r(ue,"SPAN",{"data-svelte-h":!0}),P(v)!=="svelte-ltbkr9"&&(v.textContent=b),V=k(ue),_=r(ue,"BUTTON",{class:!0,"data-svelte-h":!0}),P(_)!=="svelte-149y757"&&(_.textContent=L),ue.forEach(u),f=k(K),t=r(K,"PRE",{id:!0,class:!0});var s=p(t);T=l(s,`<script>
// MegaBuy.sk Conversion Tracking - GTM
(function() `),O=l(s,m),y=l(s,`
    var config = `),R=l(s,A),N=l(s,`
        trackingCode: '`),E=l(s,d[6]),$=l(s,`',
        trackingUrl: '`),B=l(s,d[5]),j=l(s,`'
    `),q=l(s,X),U=l(s,`;

    // Použite dataLayer premenné z vášho GTM
    var orderData = `),J=l(s,Q),w=l(s,`
        order_id: `),z=l(s,M),I=l(s,"transactionId"),ae=l(s,x),Z=l(s,`,
        customer_email: `),G=l(s,ee),F=l(s,"customerEmail"),le=l(s,oe),fe=l(s,`,
        customer_name: `),te=l(s,_e),W=l(s,"customerName"),C=l(s,ne),Be=l(s,`,
        order_value: `),re=l(s,xe),he=l(s,"transactionTotal"),Ce=l(s,He),Oe=l(s,`
    `),pe=l(s,Ke),Ue=l(s,`;

    if (orderData.order_id && orderData.customer_email) `),ie=l(s,$e),me=l(s,`
        fetch(config.trackingUrl, `),je=l(s,Je),S=l(s,`
            method: 'POST',
            headers: `),Re=l(s,be),ce=l(s," 'Content-Type': 'application/json' "),se=l(s,Y),h=l(s,`,
            body: JSON.stringify(`),Ge=l(s,ot),Te=l(s,`
                tracking_code: config.trackingCode,
                ...orderData
            `),Xe=l(s,ye),De=l(s,`)
        `),We=l(s,rt),Ee=l(s,`);
    `),Qe=l(s,qe),Ze=l(s,`
`),ze=l(s,we),Fe=l(s,`)();
<\/script>`),s.forEach(u),Ie=k(K),ke=r(K,"DIV",{class:!0,"data-svelte-h":!0}),P(ke)!=="svelte-19cewsh"&&(ke.innerHTML=at),K.forEach(u),this.h()},h(){o(_,"class","conv-copy-btn conv-copy-btn-light svelte-f64zlz"),o(c,"class","conv-code-header svelte-f64zlz"),o(t,"id","code-gtm"),o(t,"class","conv-code svelte-f64zlz"),o(ke,"class","conv-note conv-note-info svelte-f64zlz"),o(a,"class","conv-code-section svelte-f64zlz")},m(de,K){st(de,a,K),e(a,c),e(c,v),e(c,V),e(c,_),e(a,f),e(a,t),e(t,T),e(t,O),e(t,y),e(t,R),e(t,N),e(t,E),e(t,$),e(t,B),e(t,j),e(t,q),e(t,U),e(t,J),e(t,w),e(t,z),e(t,I),e(t,ae),e(t,Z),e(t,G),e(t,F),e(t,le),e(t,fe),e(t,te),e(t,W),e(t,C),e(t,Be),e(t,re),e(t,he),e(t,Ce),e(t,Oe),e(t,pe),e(t,Ue),e(t,ie),e(t,me),e(t,je),e(t,S),e(t,Re),e(t,ce),e(t,se),e(t,h),e(t,Ge),e(t,Te),e(t,Xe),e(t,De),e(t,We),e(t,Ee),e(t,Qe),e(t,Ze),e(t,ze),e(t,Fe),e(a,Ie),e(a,ke),ve||(Ve=nt(_,"click",d[21]),ve=!0)},p(de,K){K&64&&ge(E,de[6]),K&32&&ge(B,de[5])},d(de){de&&u(a),ve=!1,Ve()}}}function pl(d){let a,c='<div class="conv-empty-icon svelte-f64zlz">📊</div> <h4 class="svelte-f64zlz">Zatiaľ žiadne konverzie</h4> <p class="svelte-f64zlz">Po nastavení tracking kódu sa tu zobrazia vaše konverzie</p>';return{c(){a=i("div"),a.innerHTML=c,this.h()},l(v){a=r(v,"DIV",{class:!0,"data-svelte-h":!0}),P(a)!=="svelte-1930uw2"&&(a.innerHTML=c),this.h()},h(){o(a,"class","conv-empty svelte-f64zlz")},m(v,b){st(v,a,b)},p:Kt,d(v){v&&u(a)}}}function ml(d){let a,c,v,b='<tr><th class="svelte-f64zlz">Objednávka</th> <th class="svelte-f64zlz">Zákazník</th> <th class="svelte-f64zlz">Hodnota</th> <th class="svelte-f64zlz">Dátum</th></tr>',V,_,L=el(d[2]),f=[];for(let t=0;t<L.length;t+=1)f[t]=rl(tl(d,L,t));return{c(){a=i("div"),c=i("table"),v=i("thead"),v.innerHTML=b,V=g(),_=i("tbody");for(let t=0;t<f.length;t+=1)f[t].c();this.h()},l(t){a=r(t,"DIV",{class:!0});var T=p(a);c=r(T,"TABLE",{class:!0});var m=p(c);v=r(m,"THEAD",{"data-svelte-h":!0}),P(v)!=="svelte-1vard1x"&&(v.innerHTML=b),V=k(m),_=r(m,"TBODY",{});var O=p(_);for(let y=0;y<f.length;y+=1)f[y].l(O);O.forEach(u),m.forEach(u),T.forEach(u),this.h()},h(){o(c,"class","conv-table svelte-f64zlz"),o(a,"class","conv-table-wrap svelte-f64zlz")},m(t,T){st(t,a,T),e(a,c),e(c,v),e(c,V),e(c,_);for(let m=0;m<f.length;m+=1)f[m]&&f[m].m(_,null)},p(t,T){if(T&4){L=el(t[2]);let m;for(m=0;m<L.length;m+=1){const O=tl(t,L,m);f[m]?f[m].p(O,T):(f[m]=rl(O),f[m].c(),f[m].m(_,null))}for(;m<f.length;m+=1)f[m].d(1);f.length=L.length}},d(t){t&&u(a),fl(f,t)}}}function rl(d){let a,c,v,b=d[26].order_id+"",V,_,L,f,t,T=(d[26].customer_name||"Neuvedené")+"",m,O,y,A=d[26].customer_email+"",R,N,E,$,B=lt(d[26].order_value,2)+"",j,X,q,U,Q=il(d[26].conversion_date)+"",J,w;return{c(){a=i("tr"),c=i("td"),v=i("code"),V=n(b),_=g(),L=i("td"),f=i("div"),t=i("strong"),m=n(T),O=g(),y=i("small"),R=n(A),N=g(),E=i("td"),$=i("strong"),j=n(B),X=n(" €"),q=g(),U=i("td"),J=n(Q),w=g(),this.h()},l(M){a=r(M,"TR",{});var z=p(a);c=r(z,"TD",{class:!0});var I=p(c);v=r(I,"CODE",{class:!0});var x=p(v);V=l(x,b),x.forEach(u),I.forEach(u),_=k(z),L=r(z,"TD",{class:!0});var ae=p(L);f=r(ae,"DIV",{class:!0});var Z=p(f);t=r(Z,"STRONG",{});var ee=p(t);m=l(ee,T),ee.forEach(u),O=k(Z),y=r(Z,"SMALL",{class:!0});var G=p(y);R=l(G,A),G.forEach(u),Z.forEach(u),ae.forEach(u),N=k(z),E=r(z,"TD",{class:!0});var F=p(E);$=r(F,"STRONG",{});var oe=p($);j=l(oe,B),X=l(oe," €"),oe.forEach(u),F.forEach(u),q=k(z),U=r(z,"TD",{class:!0});var le=p(U);J=l(le,Q),le.forEach(u),w=k(z),z.forEach(u),this.h()},h(){o(v,"class","conv-order-id svelte-f64zlz"),o(c,"class","svelte-f64zlz"),o(y,"class","svelte-f64zlz"),o(f,"class","conv-customer svelte-f64zlz"),o(L,"class","svelte-f64zlz"),o(E,"class","svelte-f64zlz"),o(U,"class","svelte-f64zlz")},m(M,z){st(M,a,z),e(a,c),e(c,v),e(v,V),e(a,_),e(a,L),e(L,f),e(f,t),e(t,m),e(f,O),e(f,y),e(y,R),e(a,N),e(a,E),e(E,$),e($,j),e($,X),e(a,q),e(a,U),e(U,J),e(a,w)},p(M,z){z&4&&b!==(b=M[26].order_id+"")&&ge(V,b),z&4&&T!==(T=(M[26].customer_name||"Neuvedené")+"")&&ge(m,T),z&4&&A!==(A=M[26].customer_email+"")&&ge(R,A),z&4&&B!==(B=lt(M[26].order_value,2)+"")&&ge(j,B),z&4&&Q!==(Q=il(M[26].conversion_date)+"")&&ge(J,Q)},d(M){M&&u(a)}}}function zl(d){let a,c,v,b,V,_='<span class="material-icons-round svelte-f64zlz">verified</span>',L,f,t,T=lt(d[1].total_conversions)+"",m,O,y,A="Celkom konverzií",R,N,E,$='<span class="material-icons-round svelte-f64zlz">paid</span>',B,j,X,q=lt(d[1].total_revenue,2)+"",U,Q,J,w,M="Celkové tržby",z,I,x,ae='<span class="material-icons-round svelte-f64zlz">percent</span>',Z,ee,G,F=lt(d[1].conversion_rate,1)+"",oe,le,fe,_e,te="Konverzný pomer",W,ne,C,Be='<span class="material-icons-round svelte-f64zlz">shopping_cart</span>',xe,re,he,He=lt(d[1].avg_order_value,2)+"",Ce,Oe,Ke,pe,Ue="Priem. objednávka",$e,ie,me,Je='<h3 class="svelte-f64zlz">🔧 Nastavenie merania konverzií</h3> <span class="conv-badge svelte-f64zlz">Dôležité</span>',je,S,be,Re=`Pre správne meranie konverzií je potrebné vložiť tracking kód na vašu <strong>&quot;Thank You&quot; stránku</strong> 
                (stránka po úspešnom nákupe vo vašom e-shope).`,ce,Y,se,h,ot="Váš Tracking Code",Ge,Te,ye,Xe,De,rt="📋",We,Ee,qe,Qe="Tracking URL",Ze,we,ze,Fe,Ie,ke="📋",at,ve,Ve,de="🌐 HTML / Univerzálne",K,ue,s="🛒 WooCommerce",Ot,et,$t="🏪 Shoptet",jt,tt,Jt="📊 Google Tag Manager",Bt,ht,pt,mt,Ht,it,ut,Gt='<h3 class="svelte-f64zlz">🛍️ Posledné konverzie</h3>',Ut,ft,wt,_t,Xt='<div class="conv-card-header svelte-f64zlz"><h3 class="svelte-f64zlz">💡 Ako meranie konverzií funguje?</h3></div> <div class="conv-card-body svelte-f64zlz"><div class="conv-steps svelte-f64zlz"><div class="conv-step svelte-f64zlz"><div class="conv-step-num svelte-f64zlz">1</div> <div class="conv-step-content svelte-f64zlz"><h4 class="svelte-f64zlz">Zákazník klikne</h4> <p class="svelte-f64zlz">Zákazník klikne na váš produkt na MegaBuy.sk a je presmerovaný na váš e-shop</p></div></div> <div class="conv-step svelte-f64zlz"><div class="conv-step-num svelte-f64zlz">2</div> <div class="conv-step-content svelte-f64zlz"><h4 class="svelte-f64zlz">Nákup vo vašom e-shope</h4> <p class="svelte-f64zlz">Zákazník dokončí nákup vo vašom e-shope</p></div></div> <div class="conv-step svelte-f64zlz"><div class="conv-step-num svelte-f64zlz">3</div> <div class="conv-step-content svelte-f64zlz"><h4 class="svelte-f64zlz">Tracking zaznamená konverziu</h4> <p class="svelte-f64zlz">Váš tracking kód odošle informáciu o úspešnom nákupe</p></div></div> <div class="conv-step svelte-f64zlz"><div class="conv-step-num svelte-f64zlz">4</div> <div class="conv-step-content svelte-f64zlz"><h4 class="svelte-f64zlz">Štatistiky &amp; ROI</h4> <p class="svelte-f64zlz">Vidíte presné dáta o konverziách a návratnosti investície</p></div></div></div></div>',At,Wt,Me=d[4]&&ll(d),Se=d[0]==="html"&&nl(d),Ne=d[0]==="woocommerce"&&al(d),Pe=d[0]==="shoptet"&&sl(d),Le=d[0]==="gtm"&&ol(d);function Zt(D,H){return D[2].length>0?ml:pl}let zt=Zt(d),Ye=zt(d);return{c(){a=i("div"),Me&&Me.c(),c=g(),v=i("div"),b=i("div"),V=i("div"),V.innerHTML=_,L=g(),f=i("div"),t=i("p"),m=n(T),O=g(),y=i("h3"),y.textContent=A,R=g(),N=i("div"),E=i("div"),E.innerHTML=$,B=g(),j=i("div"),X=i("p"),U=n(q),Q=n(" €"),J=g(),w=i("h3"),w.textContent=M,z=g(),I=i("div"),x=i("div"),x.innerHTML=ae,Z=g(),ee=i("div"),G=i("p"),oe=n(F),le=n("%"),fe=g(),_e=i("h3"),_e.textContent=te,W=g(),ne=i("div"),C=i("div"),C.innerHTML=Be,xe=g(),re=i("div"),he=i("p"),Ce=n(He),Oe=n(" €"),Ke=g(),pe=i("h3"),pe.textContent=Ue,$e=g(),ie=i("div"),me=i("div"),me.innerHTML=Je,je=g(),S=i("div"),be=i("p"),be.innerHTML=Re,ce=g(),Y=i("div"),se=i("div"),h=i("label"),h.textContent=ot,Ge=g(),Te=i("div"),ye=i("input"),Xe=g(),De=i("button"),De.textContent=rt,We=g(),Ee=i("div"),qe=i("label"),qe.textContent=Qe,Ze=g(),we=i("div"),ze=i("input"),Fe=g(),Ie=i("button"),Ie.textContent=ke,at=g(),ve=i("div"),Ve=i("button"),Ve.textContent=de,K=g(),ue=i("button"),ue.textContent=s,Ot=g(),et=i("button"),et.textContent=$t,jt=g(),tt=i("button"),tt.textContent=Jt,Bt=g(),Se&&Se.c(),ht=g(),Ne&&Ne.c(),pt=g(),Pe&&Pe.c(),mt=g(),Le&&Le.c(),Ht=g(),it=i("div"),ut=i("div"),ut.innerHTML=Gt,Ut=g(),ft=i("div"),Ye.c(),wt=g(),_t=i("div"),_t.innerHTML=Xt,this.h()},l(D){a=r(D,"DIV",{class:!0});var H=p(a);Me&&Me.l(H),c=k(H),v=r(H,"DIV",{class:!0});var ct=p(v);b=r(ct,"DIV",{class:!0});var kt=p(b);V=r(kt,"DIV",{class:!0,"data-svelte-h":!0}),P(V)!=="svelte-1n0425h"&&(V.innerHTML=_),L=k(kt),f=r(kt,"DIV",{class:!0});var gt=p(f);t=r(gt,"P",{class:!0});var Ft=p(t);m=l(Ft,T),Ft.forEach(u),O=k(gt),y=r(gt,"H3",{class:!0,"data-svelte-h":!0}),P(y)!=="svelte-1lz42ce"&&(y.textContent=A),gt.forEach(u),kt.forEach(u),R=k(ct),N=r(ct,"DIV",{class:!0});var bt=p(N);E=r(bt,"DIV",{class:!0,"data-svelte-h":!0}),P(E)!=="svelte-1j9mywc"&&(E.innerHTML=$),B=k(bt),j=r(bt,"DIV",{class:!0});var Ct=p(j);X=r(Ct,"P",{class:!0});var Rt=p(X);U=l(Rt,q),Q=l(Rt," €"),Rt.forEach(u),J=k(Ct),w=r(Ct,"H3",{class:!0,"data-svelte-h":!0}),P(w)!=="svelte-12puh8k"&&(w.textContent=M),Ct.forEach(u),bt.forEach(u),z=k(ct),I=r(ct,"DIV",{class:!0});var Tt=p(I);x=r(Tt,"DIV",{class:!0,"data-svelte-h":!0}),P(x)!=="svelte-q92ux0"&&(x.innerHTML=ae),Z=k(Tt),ee=r(Tt,"DIV",{class:!0});var yt=p(ee);G=r(yt,"P",{class:!0});var qt=p(G);oe=l(qt,F),le=l(qt,"%"),qt.forEach(u),fe=k(yt),_e=r(yt,"H3",{class:!0,"data-svelte-h":!0}),P(_e)!=="svelte-8zxvmb"&&(_e.textContent=te),yt.forEach(u),Tt.forEach(u),W=k(ct),ne=r(ct,"DIV",{class:!0});var Dt=p(ne);C=r(Dt,"DIV",{class:!0,"data-svelte-h":!0}),P(C)!=="svelte-1obl0vh"&&(C.innerHTML=Be),xe=k(Dt),re=r(Dt,"DIV",{class:!0});var Et=p(re);he=r(Et,"P",{class:!0});var xt=p(he);Ce=l(xt,He),Oe=l(xt," €"),xt.forEach(u),Ke=k(Et),pe=r(Et,"H3",{class:!0,"data-svelte-h":!0}),P(pe)!=="svelte-9bya2m"&&(pe.textContent=Ue),Et.forEach(u),Dt.forEach(u),ct.forEach(u),$e=k(H),ie=r(H,"DIV",{class:!0});var It=p(ie);me=r(It,"DIV",{class:!0,"data-svelte-h":!0}),P(me)!=="svelte-2p5x58"&&(me.innerHTML=Je),je=k(It),S=r(It,"DIV",{class:!0});var Ae=p(S);be=r(Ae,"P",{class:!0,"data-svelte-h":!0}),P(be)!=="svelte-140tr5n"&&(be.innerHTML=Re),ce=k(Ae),Y=r(Ae,"DIV",{class:!0});var Vt=p(Y);se=r(Vt,"DIV",{class:!0});var Mt=p(se);h=r(Mt,"LABEL",{class:!0,"data-svelte-h":!0}),P(h)!=="svelte-aa26lm"&&(h.textContent=ot),Ge=k(Mt),Te=r(Mt,"DIV",{class:!0});var St=p(Te);ye=r(St,"INPUT",{type:!0,id:!0,class:!0}),Xe=k(St),De=r(St,"BUTTON",{class:!0,"data-svelte-h":!0}),P(De)!=="svelte-14kyod0"&&(De.textContent=rt),St.forEach(u),Mt.forEach(u),We=k(Vt),Ee=r(Vt,"DIV",{class:!0});var Nt=p(Ee);qe=r(Nt,"LABEL",{class:!0,"data-svelte-h":!0}),P(qe)!=="svelte-f6xkh0"&&(qe.textContent=Qe),Ze=k(Nt),we=r(Nt,"DIV",{class:!0});var Pt=p(we);ze=r(Pt,"INPUT",{type:!0,id:!0,class:!0}),Fe=k(Pt),Ie=r(Pt,"BUTTON",{class:!0,"data-svelte-h":!0}),P(Ie)!=="svelte-1p42uxw"&&(Ie.textContent=ke),Pt.forEach(u),Nt.forEach(u),Vt.forEach(u),at=k(Ae),ve=r(Ae,"DIV",{class:!0});var vt=p(ve);Ve=r(vt,"BUTTON",{class:!0,"data-svelte-h":!0}),P(Ve)!=="svelte-kk57m5"&&(Ve.textContent=de),K=k(vt),ue=r(vt,"BUTTON",{class:!0,"data-svelte-h":!0}),P(ue)!=="svelte-qbtos3"&&(ue.textContent=s),Ot=k(vt),et=r(vt,"BUTTON",{class:!0,"data-svelte-h":!0}),P(et)!=="svelte-11nxknp"&&(et.textContent=$t),jt=k(vt),tt=r(vt,"BUTTON",{class:!0,"data-svelte-h":!0}),P(tt)!=="svelte-12av28n"&&(tt.textContent=Jt),vt.forEach(u),Bt=k(Ae),Se&&Se.l(Ae),ht=k(Ae),Ne&&Ne.l(Ae),pt=k(Ae),Pe&&Pe.l(Ae),mt=k(Ae),Le&&Le.l(Ae),Ae.forEach(u),It.forEach(u),Ht=k(H),it=r(H,"DIV",{class:!0});var Lt=p(it);ut=r(Lt,"DIV",{class:!0,"data-svelte-h":!0}),P(ut)!=="svelte-c26q0b"&&(ut.innerHTML=Gt),Ut=k(Lt),ft=r(Lt,"DIV",{class:!0});var Yt=p(ft);Ye.l(Yt),Yt.forEach(u),Lt.forEach(u),wt=k(H),_t=r(H,"DIV",{class:!0,"data-svelte-h":!0}),P(_t)!=="svelte-ih1qmk"&&(_t.innerHTML=Xt),H.forEach(u),this.h()},h(){o(V,"class","mkma-stat-icon s1 svelte-f64zlz"),o(t,"class","mkma-stat-value svelte-f64zlz"),o(y,"class","svelte-f64zlz"),o(f,"class","mkma-stat-body svelte-f64zlz"),o(b,"class","mkma-stat-card svelte-f64zlz"),o(E,"class","mkma-stat-icon s2 svelte-f64zlz"),o(X,"class","mkma-stat-value svelte-f64zlz"),o(w,"class","svelte-f64zlz"),o(j,"class","mkma-stat-body svelte-f64zlz"),o(N,"class","mkma-stat-card svelte-f64zlz"),o(x,"class","mkma-stat-icon s3 svelte-f64zlz"),o(G,"class","mkma-stat-value svelte-f64zlz"),o(_e,"class","svelte-f64zlz"),o(ee,"class","mkma-stat-body svelte-f64zlz"),o(I,"class","mkma-stat-card svelte-f64zlz"),o(C,"class","mkma-stat-icon s4 svelte-f64zlz"),o(he,"class","mkma-stat-value svelte-f64zlz"),o(pe,"class","svelte-f64zlz"),o(re,"class","mkma-stat-body svelte-f64zlz"),o(ne,"class","mkma-stat-card svelte-f64zlz"),o(v,"class","mkma-stats-grid svelte-f64zlz"),o(me,"class","conv-card-header conv-card-header-warning svelte-f64zlz"),o(be,"class","conv-intro svelte-f64zlz"),o(h,"class","svelte-f64zlz"),o(ye,"type","text"),ye.value=d[6],ye.readOnly=!0,o(ye,"id","tracking-code"),o(ye,"class","conv-input svelte-f64zlz"),o(De,"class","conv-copy-btn svelte-f64zlz"),o(Te,"class","conv-input-group svelte-f64zlz"),o(se,"class","conv-credential svelte-f64zlz"),o(qe,"class","svelte-f64zlz"),o(ze,"type","text"),ze.value=d[5],ze.readOnly=!0,o(ze,"id","tracking-url"),o(ze,"class","conv-input svelte-f64zlz"),o(Ie,"class","conv-copy-btn svelte-f64zlz"),o(we,"class","conv-input-group svelte-f64zlz"),o(Ee,"class","conv-credential svelte-f64zlz"),o(Y,"class","conv-credentials svelte-f64zlz"),o(Ve,"class","conv-tab svelte-f64zlz"),dt(Ve,"active",d[0]==="html"),o(ue,"class","conv-tab svelte-f64zlz"),dt(ue,"active",d[0]==="woocommerce"),o(et,"class","conv-tab svelte-f64zlz"),dt(et,"active",d[0]==="shoptet"),o(tt,"class","conv-tab svelte-f64zlz"),dt(tt,"active",d[0]==="gtm"),o(ve,"class","conv-tabs svelte-f64zlz"),o(S,"class","conv-card-body svelte-f64zlz"),o(ie,"class","conv-card conv-tracking-card svelte-f64zlz"),o(ut,"class","conv-card-header svelte-f64zlz"),o(ft,"class","conv-card-body svelte-f64zlz"),o(it,"class","conv-card svelte-f64zlz"),o(_t,"class","conv-card conv-how-it-works svelte-f64zlz"),o(a,"class","conv-page svelte-f64zlz")},m(D,H){st(D,a,H),Me&&Me.m(a,null),e(a,c),e(a,v),e(v,b),e(b,V),e(b,L),e(b,f),e(f,t),e(t,m),e(f,O),e(f,y),e(v,R),e(v,N),e(N,E),e(N,B),e(N,j),e(j,X),e(X,U),e(X,Q),e(j,J),e(j,w),e(v,z),e(v,I),e(I,x),e(I,Z),e(I,ee),e(ee,G),e(G,oe),e(G,le),e(ee,fe),e(ee,_e),e(v,W),e(v,ne),e(ne,C),e(ne,xe),e(ne,re),e(re,he),e(he,Ce),e(he,Oe),e(re,Ke),e(re,pe),e(a,$e),e(a,ie),e(ie,me),e(ie,je),e(ie,S),e(S,be),e(S,ce),e(S,Y),e(Y,se),e(se,h),e(se,Ge),e(se,Te),e(Te,ye),e(Te,Xe),e(Te,De),e(Y,We),e(Y,Ee),e(Ee,qe),e(Ee,Ze),e(Ee,we),e(we,ze),e(we,Fe),e(we,Ie),e(S,at),e(S,ve),e(ve,Ve),e(ve,K),e(ve,ue),e(ve,Ot),e(ve,et),e(ve,jt),e(ve,tt),e(S,Bt),Se&&Se.m(S,null),e(S,ht),Ne&&Ne.m(S,null),e(S,pt),Pe&&Pe.m(S,null),e(S,mt),Le&&Le.m(S,null),e(a,Ht),e(a,it),e(it,ut),e(it,Ut),e(it,ft),Ye.m(ft,null),e(a,wt),e(a,_t),At||(Wt=[nt(De,"click",d[12]),nt(Ie,"click",d[13]),nt(Ve,"click",d[14]),nt(ue,"click",d[15]),nt(et,"click",d[16]),nt(tt,"click",d[17])],At=!0)},p(D,[H]){D[4]?Me?Me.p(D,H):(Me=ll(D),Me.c(),Me.m(a,c)):Me&&(Me.d(1),Me=null),H&2&&T!==(T=lt(D[1].total_conversions)+"")&&ge(m,T),H&2&&q!==(q=lt(D[1].total_revenue,2)+"")&&ge(U,q),H&2&&F!==(F=lt(D[1].conversion_rate,1)+"")&&ge(oe,F),H&2&&He!==(He=lt(D[1].avg_order_value,2)+"")&&ge(Ce,He),H&64&&ye.value!==D[6]&&(ye.value=D[6]),H&32&&ze.value!==D[5]&&(ze.value=D[5]),H&1&&dt(Ve,"active",D[0]==="html"),H&1&&dt(ue,"active",D[0]==="woocommerce"),H&1&&dt(et,"active",D[0]==="shoptet"),H&1&&dt(tt,"active",D[0]==="gtm"),D[0]==="html"?Se?Se.p(D,H):(Se=nl(D),Se.c(),Se.m(S,ht)):Se&&(Se.d(1),Se=null),D[0]==="woocommerce"?Ne?Ne.p(D,H):(Ne=al(D),Ne.c(),Ne.m(S,pt)):Ne&&(Ne.d(1),Ne=null),D[0]==="shoptet"?Pe?Pe.p(D,H):(Pe=sl(D),Pe.c(),Pe.m(S,mt)):Pe&&(Pe.d(1),Pe=null),D[0]==="gtm"?Le?Le.p(D,H):(Le=ol(D),Le.c(),Le.m(S,null)):Le&&(Le.d(1),Le=null),zt===(zt=Zt(D))&&Ye?Ye.p(D,H):(Ye.d(1),Ye=zt(D),Ye&&(Ye.c(),Ye.m(ft,null)))},i:Kt,o:Kt,d(D){D&&u(a),Me&&Me.d(),Se&&Se.d(),Ne&&Ne.d(),Pe&&Pe.d(),Le&&Le.d(),Ye.d(),At=!1,vl(Wt)}}}function lt(d,a=0){return(d||0).toLocaleString("sk-SK",{minimumFractionDigits:a,maximumFractionDigits:a})}function il(d){return new Date(d).toLocaleDateString("sk-SK",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})}function kl(d,a,c){let v,b,V,_;const L=Qt("shop");dl(d,L,z=>c(11,_=z));const f=Qt("API_BASE");let t="html",T={total_conversions:0,total_revenue:0,conversion_rate:0,avg_order_value:0,conversions_change:12.5},m=[];ul(async()=>{await O()});async function O(){const z=localStorage.getItem("vendor_token");if(z)try{const x=await(await fetch(`${f}/vendor/analytics`,{headers:{Authorization:`Bearer ${z}`}})).json();x.success&&x.data&&(c(1,T={...T,...x.data}),c(2,m=x.data.recent_conversions||[]))}catch{console.log("Analytics endpoint not available yet")}}function y(z){const I=document.getElementById(z);I&&(navigator.clipboard.writeText(I.value||I.textContent),E("Skopírované do schránky!"))}function A(z){const I=document.getElementById(z);I&&(navigator.clipboard.writeText(I.textContent),E("Kód skopírovaný!"))}let R="",N=!1;function E(z){c(3,R=z),c(4,N=!0),setTimeout(()=>c(4,N=!1),2e3)}const $=()=>y("tracking-code"),B=()=>y("tracking-url"),j=()=>c(0,t="html"),X=()=>c(0,t="woocommerce"),q=()=>c(0,t="shoptet"),U=()=>c(0,t="gtm"),Q=()=>A("code-html"),J=()=>A("code-woo"),w=()=>A("code-shoptet"),M=()=>A("code-gtm");return d.$$.update=()=>{d.$$.dirty&2048&&c(10,v=_),d.$$.dirty&1024&&c(6,b=v!=null&&v.id?`MKP-${v.id.substring(0,8).toUpperCase()}`:"MKP-XXXXXXXX")},c(5,V=f?`${f}/track/conversion`:"https://megabuy.sk/api/v1/track/conversion"),[t,T,m,R,N,V,b,L,y,A,v,_,$,B,j,X,q,U,Q,J,w,M]}class Tl extends _l{constructor(a){super(),hl(this,a,kl,zl,cl,{})}}export{Tl as component};
