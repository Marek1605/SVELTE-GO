import{s as Tn,n as en,d as u,r as Dn,a as ve,x as mt,i as ct,b as e,y as st,q as d,c as s,e as p,g as m,w as I,f as n,h as r,j as b,t as l,S as _n,k as En,B as yn,m as Pn}from"../chunks/DegHwCHz.js";import{e as hn}from"../chunks/BS8_HMP2.js";import{S as In,i as Sn}from"../chunks/DwtPztOd.js";function pn(i,o,c){const v=i.slice();return v[26]=o[c],v}function fn(i){let o,c;return{c(){o=r("div"),c=l(i[3]),this.h()},l(v){o=s(v,"DIV",{class:!0});var z=p(o);c=n(z,i[3]),z.forEach(u),this.h()},h(){d(o,"class","conv-toast svelte-1o5zbdd")},m(v,z){ct(v,o,z),e(o,c)},p(v,z){z&8&&ve(c,v[3])},d(v){v&&u(o)}}}function mn(i){let o,c,v,z="Tracking skript pre Thank You stránku",y,h,V="📋 Kopírovať kód",_,t,D,g="{",P,E,x="{",q,S,M,R,L,$,ae="}",B,O,ne="{",J,j,N="}",k,U,K="{",F,W,ue="{",le,G,_e="{",oe,Y,se="}",te,Z,Q="{",C,Oe,Re="}",re,fe,xe="}",Ie,Se,be="}",je,Ne,me="}",de,Le,Be,ce;return{c(){o=r("div"),c=r("div"),v=r("span"),v.textContent=z,y=b(),h=r("button"),h.textContent=V,_=b(),t=r("pre"),D=l(`<!-- MegaPrice.sk Conversion Tracking -->
<script>
(function() `),P=l(g),E=l(`
    var config = `),q=l(x),S=l(`
        trackingCode: '`),M=l(i[6]),R=l(`',
        trackingUrl: '`),L=l(i[5]),$=l(`'
    `),B=l(ae),O=l(`;

    // ⚠️ DÔLEŽITÉ: Nahraďte tieto hodnoty skutočnými dátami z objednávky
    var orderData = `),J=l(ne),j=l(`
        order_id: 'ORDER-12345',           // ID vašej objednávky
        customer_email: 'zakaznik@email.sk',
        customer_name: 'Ján Novák',
        order_value: 49.99                  // Celková suma objednávky v EUR
    `),k=l(N),U=l(`;

    if (orderData.order_id && orderData.customer_email) `),F=l(K),W=l(`
        fetch(config.trackingUrl, `),le=l(ue),G=l(`
            method: 'POST',
            headers: `),oe=l(_e),Y=l(" 'Content-Type': 'application/json' "),te=l(se),Z=l(`,
            body: JSON.stringify(`),C=l(Q),Oe=l(`
                tracking_code: config.trackingCode,
                ...orderData
            `),re=l(Re),fe=l(`)
        `),Ie=l(xe),Se=l(`).then(r => r.json())
          .then(d => console.log('MegaPrice: Conversion tracked', d))
          .catch(e => console.error('MegaPrice: Error', e));
    `),je=l(be),Ne=l(`
`),de=l(me),Le=l(`)();
<\/script>`),this.h()},l(ee){o=s(ee,"DIV",{class:!0});var he=p(o);c=s(he,"DIV",{class:!0});var ke=p(c);v=s(ke,"SPAN",{"data-svelte-h":!0}),I(v)!=="svelte-176l7do"&&(v.textContent=z),y=m(ke),h=s(ke,"BUTTON",{class:!0,"data-svelte-h":!0}),I(h)!=="svelte-ered5w"&&(h.textContent=V),ke.forEach(u),_=m(he),t=s(he,"PRE",{id:!0,class:!0});var f=p(t);D=n(f,`<!-- MegaPrice.sk Conversion Tracking -->
<script>
(function() `),P=n(f,g),E=n(f,`
    var config = `),q=n(f,x),S=n(f,`
        trackingCode: '`),M=n(f,i[6]),R=n(f,`',
        trackingUrl: '`),L=n(f,i[5]),$=n(f,`'
    `),B=n(f,ae),O=n(f,`;

    // ⚠️ DÔLEŽITÉ: Nahraďte tieto hodnoty skutočnými dátami z objednávky
    var orderData = `),J=n(f,ne),j=n(f,`
        order_id: 'ORDER-12345',           // ID vašej objednávky
        customer_email: 'zakaznik@email.sk',
        customer_name: 'Ján Novák',
        order_value: 49.99                  // Celková suma objednávky v EUR
    `),k=n(f,N),U=n(f,`;

    if (orderData.order_id && orderData.customer_email) `),F=n(f,K),W=n(f,`
        fetch(config.trackingUrl, `),le=n(f,ue),G=n(f,`
            method: 'POST',
            headers: `),oe=n(f,_e),Y=n(f," 'Content-Type': 'application/json' "),te=n(f,se),Z=n(f,`,
            body: JSON.stringify(`),C=n(f,Q),Oe=n(f,`
                tracking_code: config.trackingCode,
                ...orderData
            `),re=n(f,Re),fe=n(f,`)
        `),Ie=n(f,xe),Se=n(f,`).then(r => r.json())
          .then(d => console.log('MegaPrice: Conversion tracked', d))
          .catch(e => console.error('MegaPrice: Error', e));
    `),je=n(f,be),Ne=n(f,`
`),de=n(f,me),Le=n(f,`)();
<\/script>`),f.forEach(u),he.forEach(u),this.h()},h(){d(h,"class","conv-copy-btn conv-copy-btn-light svelte-1o5zbdd"),d(c,"class","conv-code-header svelte-1o5zbdd"),d(t,"id","code-html"),d(t,"class","conv-code svelte-1o5zbdd"),d(o,"class","conv-code-section svelte-1o5zbdd")},m(ee,he){ct(ee,o,he),e(o,c),e(c,v),e(c,y),e(c,h),e(o,_),e(o,t),e(t,D),e(t,P),e(t,E),e(t,q),e(t,S),e(t,M),e(t,R),e(t,L),e(t,$),e(t,B),e(t,O),e(t,J),e(t,j),e(t,k),e(t,U),e(t,F),e(t,W),e(t,le),e(t,G),e(t,oe),e(t,Y),e(t,te),e(t,Z),e(t,C),e(t,Oe),e(t,re),e(t,fe),e(t,Ie),e(t,Se),e(t,je),e(t,Ne),e(t,de),e(t,Le),Be||(ce=st(h,"click",i[18]),Be=!0)},p(ee,he){he&64&&ve(M,ee[6]),he&32&&ve(L,ee[5])},d(ee){ee&&u(o),Be=!1,ce()}}}function bn(i){let o,c,v,z="Pridajte do functions.php vašej témy",y,h,V="📋 Kopírovať kód",_,t,D,g="{",P,E,x,q,S,M,R="{",L,$,ae="{",B,O,ne="}",J,j,N="{",k,U,K="}",F,W,ue="}",le,G,_e="}",oe,Y,se;return{c(){o=r("div"),c=r("div"),v=r("span"),v.textContent=z,y=b(),h=r("button"),h.textContent=V,_=b(),t=r("pre"),D=l(`<?php
// MegaPrice.sk Conversion Tracking pre WooCommerce
add_action('woocommerce_thankyou', 'megaprice_track_conversion', 10, 1);
function megaprice_track_conversion($order_id) `),P=l(g),E=l(`
    if (!$order_id) return;
    
    $order = wc_get_order($order_id);
    if (!$order) return;
    
    $tracking_code = '`),x=l(i[6]),q=l(`';
    $tracking_url = '`),S=l(i[5]),M=l(`';
    ?>
    <script>
    fetch('<?php echo $tracking_url; ?>', `),L=l(R),$=l(`
        method: 'POST',
        headers: `),B=l(ae),O=l(" 'Content-Type': 'application/json' "),J=l(ne),j=l(`,
        body: JSON.stringify(`),k=l(N),U=l(`
            tracking_code: '<?php echo $tracking_code; ?>',
            order_id: '<?php echo $order->get_order_number(); ?>',
            customer_email: '<?php echo $order->get_billing_email(); ?>',
            customer_name: '<?php echo $order->get_billing_first_name() . " " . $order->get_billing_last_name(); ?>',
            order_value: <?php echo $order->get_total(); ?>
        `),F=l(K),W=l(`)
    `),le=l(ue),G=l(`);
    <\/script>
    <?php
`),oe=l(_e),this.h()},l(te){o=s(te,"DIV",{class:!0});var Z=p(o);c=s(Z,"DIV",{class:!0});var Q=p(c);v=s(Q,"SPAN",{"data-svelte-h":!0}),I(v)!=="svelte-1jxeu93"&&(v.textContent=z),y=m(Q),h=s(Q,"BUTTON",{class:!0,"data-svelte-h":!0}),I(h)!=="svelte-m1iuc2"&&(h.textContent=V),Q.forEach(u),_=m(Z),t=s(Z,"PRE",{id:!0,class:!0});var C=p(t);D=n(C,`<?php
// MegaPrice.sk Conversion Tracking pre WooCommerce
add_action('woocommerce_thankyou', 'megaprice_track_conversion', 10, 1);
function megaprice_track_conversion($order_id) `),P=n(C,g),E=n(C,`
    if (!$order_id) return;
    
    $order = wc_get_order($order_id);
    if (!$order) return;
    
    $tracking_code = '`),x=n(C,i[6]),q=n(C,`';
    $tracking_url = '`),S=n(C,i[5]),M=n(C,`';
    ?>
    <script>
    fetch('<?php echo $tracking_url; ?>', `),L=n(C,R),$=n(C,`
        method: 'POST',
        headers: `),B=n(C,ae),O=n(C," 'Content-Type': 'application/json' "),J=n(C,ne),j=n(C,`,
        body: JSON.stringify(`),k=n(C,N),U=n(C,`
            tracking_code: '<?php echo $tracking_code; ?>',
            order_id: '<?php echo $order->get_order_number(); ?>',
            customer_email: '<?php echo $order->get_billing_email(); ?>',
            customer_name: '<?php echo $order->get_billing_first_name() . " " . $order->get_billing_last_name(); ?>',
            order_value: <?php echo $order->get_total(); ?>
        `),F=n(C,K),W=n(C,`)
    `),le=n(C,ue),G=n(C,`);
    <\/script>
    <?php
`),oe=n(C,_e),C.forEach(u),Z.forEach(u),this.h()},h(){d(h,"class","conv-copy-btn conv-copy-btn-light svelte-1o5zbdd"),d(c,"class","conv-code-header svelte-1o5zbdd"),d(t,"id","code-woo"),d(t,"class","conv-code svelte-1o5zbdd"),d(o,"class","conv-code-section svelte-1o5zbdd")},m(te,Z){ct(te,o,Z),e(o,c),e(c,v),e(c,y),e(c,h),e(o,_),e(o,t),e(t,D),e(t,P),e(t,E),e(t,x),e(t,q),e(t,S),e(t,M),e(t,L),e(t,$),e(t,B),e(t,O),e(t,J),e(t,j),e(t,k),e(t,U),e(t,F),e(t,W),e(t,le),e(t,G),e(t,oe),Y||(se=st(h,"click",i[19]),Y=!0)},p(te,Z){Z&64&&ve(x,te[6]),Z&32&&ve(S,te[5])},d(te){te&&u(o),Y=!1,se()}}}function kn(i){let o,c,v,z='Pre Shoptet - vložte do "Vlastný kód na ďakovnej stránke"',y,h,V="📋 Kopírovať kód",_,t,D,g="{",P,E,x="{",q,S,M,R,L,$,ae="}",B,O,ne="{",J,j,N="{",k,U,K="}",F,W,ue="{",le,G,_e="}",oe,Y,se="{",te,Z,Q="}",C,Oe,Re="{",re,fe,xe="}",Ie,Se,be="}",je,Ne,me="{",de,Le,Be="{",ce,ee,he="{",ke,f,Je="}",qe,Ge,rt="{",ge,Ve,it="}",Xe,H,He="}",Ye,We,Ue="}",ze,Me,vt="}",Ze,Ce,pe,ie,we=`<strong>📍 Kde nájsť v Shoptete:</strong><br/>
                        Nastavenia → Nastavenia eshopu → Vzhľad a obsah → Vlastný kód → Thank you stránka`,Qe,dt;return{c(){o=r("div"),c=r("div"),v=r("span"),v.textContent=z,y=b(),h=r("button"),h.textContent=V,_=b(),t=r("pre"),D=l(`<!-- MegaPrice.sk Conversion Tracking pre Shoptet -->
<script>
(function() `),P=l(g),E=l(`
    var config = `),q=l(x),S=l(`
        trackingCode: '`),M=l(i[6]),R=l(`',
        trackingUrl: '`),L=l(i[5]),$=l(`'
    `),B=l(ae),O=l(`;

    // Shoptet premenné - automaticky nahradené systémom
    var orderData = `),J=l(ne),j=l(`
        order_id: '`),k=l(N),U=l("orderCode"),F=l(K),W=l(`',
        customer_email: '`),le=l(ue),G=l("customerEmail"),oe=l(_e),Y=l(`',
        customer_name: '`),te=l(se),Z=l("customerName"),C=l(Q),Oe=l(`',
        order_value: parseFloat('`),re=l(Re),fe=l("orderPriceWithVat"),Ie=l(xe),Se=l(`'.replace(',', '.'))
    `),je=l(be),Ne=l(`;

    if (orderData.order_id && orderData.customer_email) `),de=l(me),Le=l(`
        fetch(config.trackingUrl, `),ce=l(Be),ee=l(`
            method: 'POST',
            headers: `),ke=l(he),f=l(" 'Content-Type': 'application/json' "),qe=l(Je),Ge=l(`,
            body: JSON.stringify(`),ge=l(rt),Ve=l(`
                tracking_code: config.trackingCode,
                ...orderData
            `),Xe=l(it),H=l(`)
        `),Ye=l(He),We=l(`);
    `),ze=l(Ue),Me=l(`
`),Ze=l(vt),Ce=l(`)();
<\/script>`),pe=b(),ie=r("div"),ie.innerHTML=we,this.h()},l(X){o=s(X,"DIV",{class:!0});var w=p(o);c=s(w,"DIV",{class:!0});var Ke=p(c);v=s(Ke,"SPAN",{"data-svelte-h":!0}),I(v)!=="svelte-1litlh7"&&(v.textContent=z),y=m(Ke),h=s(Ke,"BUTTON",{class:!0,"data-svelte-h":!0}),I(h)!=="svelte-12btvj8"&&(h.textContent=V),Ke.forEach(u),_=m(w),t=s(w,"PRE",{id:!0,class:!0});var a=p(t);D=n(a,`<!-- MegaPrice.sk Conversion Tracking pre Shoptet -->
<script>
(function() `),P=n(a,g),E=n(a,`
    var config = `),q=n(a,x),S=n(a,`
        trackingCode: '`),M=n(a,i[6]),R=n(a,`',
        trackingUrl: '`),L=n(a,i[5]),$=n(a,`'
    `),B=n(a,ae),O=n(a,`;

    // Shoptet premenné - automaticky nahradené systémom
    var orderData = `),J=n(a,ne),j=n(a,`
        order_id: '`),k=n(a,N),U=n(a,"orderCode"),F=n(a,K),W=n(a,`',
        customer_email: '`),le=n(a,ue),G=n(a,"customerEmail"),oe=n(a,_e),Y=n(a,`',
        customer_name: '`),te=n(a,se),Z=n(a,"customerName"),C=n(a,Q),Oe=n(a,`',
        order_value: parseFloat('`),re=n(a,Re),fe=n(a,"orderPriceWithVat"),Ie=n(a,xe),Se=n(a,`'.replace(',', '.'))
    `),je=n(a,be),Ne=n(a,`;

    if (orderData.order_id && orderData.customer_email) `),de=n(a,me),Le=n(a,`
        fetch(config.trackingUrl, `),ce=n(a,Be),ee=n(a,`
            method: 'POST',
            headers: `),ke=n(a,he),f=n(a," 'Content-Type': 'application/json' "),qe=n(a,Je),Ge=n(a,`,
            body: JSON.stringify(`),ge=n(a,rt),Ve=n(a,`
                tracking_code: config.trackingCode,
                ...orderData
            `),Xe=n(a,it),H=n(a,`)
        `),Ye=n(a,He),We=n(a,`);
    `),ze=n(a,Ue),Me=n(a,`
`),Ze=n(a,vt),Ce=n(a,`)();
<\/script>`),a.forEach(u),pe=m(w),ie=s(w,"DIV",{class:!0,"data-svelte-h":!0}),I(ie)!=="svelte-y8lj0f"&&(ie.innerHTML=we),w.forEach(u),this.h()},h(){d(h,"class","conv-copy-btn conv-copy-btn-light svelte-1o5zbdd"),d(c,"class","conv-code-header svelte-1o5zbdd"),d(t,"id","code-shoptet"),d(t,"class","conv-code svelte-1o5zbdd"),d(ie,"class","conv-note conv-note-info svelte-1o5zbdd"),d(o,"class","conv-code-section svelte-1o5zbdd")},m(X,w){ct(X,o,w),e(o,c),e(c,v),e(c,y),e(c,h),e(o,_),e(o,t),e(t,D),e(t,P),e(t,E),e(t,q),e(t,S),e(t,M),e(t,R),e(t,L),e(t,$),e(t,B),e(t,O),e(t,J),e(t,j),e(t,k),e(t,U),e(t,F),e(t,W),e(t,le),e(t,G),e(t,oe),e(t,Y),e(t,te),e(t,Z),e(t,C),e(t,Oe),e(t,re),e(t,fe),e(t,Ie),e(t,Se),e(t,je),e(t,Ne),e(t,de),e(t,Le),e(t,ce),e(t,ee),e(t,ke),e(t,f),e(t,qe),e(t,Ge),e(t,ge),e(t,Ve),e(t,Xe),e(t,H),e(t,Ye),e(t,We),e(t,ze),e(t,Me),e(t,Ze),e(t,Ce),e(o,pe),e(o,ie),Qe||(dt=st(h,"click",i[20]),Qe=!0)},p(X,w){w&64&&ve(M,X[6]),w&32&&ve(L,X[5])},d(X){X&&u(o),Qe=!1,dt()}}}function gn(i){let o,c,v,z="Google Tag Manager - Custom HTML Tag",y,h,V="📋 Kopírovať kód",_,t,D,g="{",P,E,x="{",q,S,M,R,L,$,ae="}",B,O,ne="{",J,j,N="{",k,U,K="}",F,W,ue="{",le,G,_e="}",oe,Y,se="{",te,Z,Q="}",C,Oe,Re="{",re,fe,xe="}",Ie,Se,be="}",je,Ne,me="{",de,Le,Be="{",ce,ee,he="{",ke,f,Je="}",qe,Ge,rt="{",ge,Ve,it="}",Xe,H,He="}",Ye,We,Ue="}",ze,Me,vt="}",Ze,Ce,pe,ie,we=`<strong>⚙️ Nastavenie triggeru:</strong><br/>
                        Vytvorte trigger typu &quot;Page View&quot; s podmienkou: Page Path contains &quot;thank&quot; alebo &quot;dakujeme&quot;`,Qe,dt;return{c(){o=r("div"),c=r("div"),v=r("span"),v.textContent=z,y=b(),h=r("button"),h.textContent=V,_=b(),t=r("pre"),D=l(`<script>
// MegaPrice.sk Conversion Tracking - GTM
(function() `),P=l(g),E=l(`
    var config = `),q=l(x),S=l(`
        trackingCode: '`),M=l(i[6]),R=l(`',
        trackingUrl: '`),L=l(i[5]),$=l(`'
    `),B=l(ae),O=l(`;

    // Použite dataLayer premenné z vášho GTM
    var orderData = `),J=l(ne),j=l(`
        order_id: `),k=l(N),U=l("transactionId"),F=l(K),W=l(`,
        customer_email: `),le=l(ue),G=l("customerEmail"),oe=l(_e),Y=l(`,
        customer_name: `),te=l(se),Z=l("customerName"),C=l(Q),Oe=l(`,
        order_value: `),re=l(Re),fe=l("transactionTotal"),Ie=l(xe),Se=l(`
    `),je=l(be),Ne=l(`;

    if (orderData.order_id && orderData.customer_email) `),de=l(me),Le=l(`
        fetch(config.trackingUrl, `),ce=l(Be),ee=l(`
            method: 'POST',
            headers: `),ke=l(he),f=l(" 'Content-Type': 'application/json' "),qe=l(Je),Ge=l(`,
            body: JSON.stringify(`),ge=l(rt),Ve=l(`
                tracking_code: config.trackingCode,
                ...orderData
            `),Xe=l(it),H=l(`)
        `),Ye=l(He),We=l(`);
    `),ze=l(Ue),Me=l(`
`),Ze=l(vt),Ce=l(`)();
<\/script>`),pe=b(),ie=r("div"),ie.innerHTML=we,this.h()},l(X){o=s(X,"DIV",{class:!0});var w=p(o);c=s(w,"DIV",{class:!0});var Ke=p(c);v=s(Ke,"SPAN",{"data-svelte-h":!0}),I(v)!=="svelte-ltbkr9"&&(v.textContent=z),y=m(Ke),h=s(Ke,"BUTTON",{class:!0,"data-svelte-h":!0}),I(h)!=="svelte-149y757"&&(h.textContent=V),Ke.forEach(u),_=m(w),t=s(w,"PRE",{id:!0,class:!0});var a=p(t);D=n(a,`<script>
// MegaPrice.sk Conversion Tracking - GTM
(function() `),P=n(a,g),E=n(a,`
    var config = `),q=n(a,x),S=n(a,`
        trackingCode: '`),M=n(a,i[6]),R=n(a,`',
        trackingUrl: '`),L=n(a,i[5]),$=n(a,`'
    `),B=n(a,ae),O=n(a,`;

    // Použite dataLayer premenné z vášho GTM
    var orderData = `),J=n(a,ne),j=n(a,`
        order_id: `),k=n(a,N),U=n(a,"transactionId"),F=n(a,K),W=n(a,`,
        customer_email: `),le=n(a,ue),G=n(a,"customerEmail"),oe=n(a,_e),Y=n(a,`,
        customer_name: `),te=n(a,se),Z=n(a,"customerName"),C=n(a,Q),Oe=n(a,`,
        order_value: `),re=n(a,Re),fe=n(a,"transactionTotal"),Ie=n(a,xe),Se=n(a,`
    `),je=n(a,be),Ne=n(a,`;

    if (orderData.order_id && orderData.customer_email) `),de=n(a,me),Le=n(a,`
        fetch(config.trackingUrl, `),ce=n(a,Be),ee=n(a,`
            method: 'POST',
            headers: `),ke=n(a,he),f=n(a," 'Content-Type': 'application/json' "),qe=n(a,Je),Ge=n(a,`,
            body: JSON.stringify(`),ge=n(a,rt),Ve=n(a,`
                tracking_code: config.trackingCode,
                ...orderData
            `),Xe=n(a,it),H=n(a,`)
        `),Ye=n(a,He),We=n(a,`);
    `),ze=n(a,Ue),Me=n(a,`
`),Ze=n(a,vt),Ce=n(a,`)();
<\/script>`),a.forEach(u),pe=m(w),ie=s(w,"DIV",{class:!0,"data-svelte-h":!0}),I(ie)!=="svelte-19cewsh"&&(ie.innerHTML=we),w.forEach(u),this.h()},h(){d(h,"class","conv-copy-btn conv-copy-btn-light svelte-1o5zbdd"),d(c,"class","conv-code-header svelte-1o5zbdd"),d(t,"id","code-gtm"),d(t,"class","conv-code svelte-1o5zbdd"),d(ie,"class","conv-note conv-note-info svelte-1o5zbdd"),d(o,"class","conv-code-section svelte-1o5zbdd")},m(X,w){ct(X,o,w),e(o,c),e(c,v),e(c,y),e(c,h),e(o,_),e(o,t),e(t,D),e(t,P),e(t,E),e(t,q),e(t,S),e(t,M),e(t,R),e(t,L),e(t,$),e(t,B),e(t,O),e(t,J),e(t,j),e(t,k),e(t,U),e(t,F),e(t,W),e(t,le),e(t,G),e(t,oe),e(t,Y),e(t,te),e(t,Z),e(t,C),e(t,Oe),e(t,re),e(t,fe),e(t,Ie),e(t,Se),e(t,je),e(t,Ne),e(t,de),e(t,Le),e(t,ce),e(t,ee),e(t,ke),e(t,f),e(t,qe),e(t,Ge),e(t,ge),e(t,Ve),e(t,Xe),e(t,H),e(t,Ye),e(t,We),e(t,ze),e(t,Me),e(t,Ze),e(t,Ce),e(o,pe),e(o,ie),Qe||(dt=st(h,"click",i[21]),Qe=!0)},p(X,w){w&64&&ve(M,X[6]),w&32&&ve(L,X[5])},d(X){X&&u(o),Qe=!1,dt()}}}function Nn(i){let o,c='<div class="conv-empty-icon svelte-1o5zbdd">📊</div> <h4 class="svelte-1o5zbdd">Zatiaľ žiadne konverzie</h4> <p class="svelte-1o5zbdd">Po nastavení tracking kódu sa tu zobrazia vaše konverzie</p>';return{c(){o=r("div"),o.innerHTML=c,this.h()},l(v){o=s(v,"DIV",{class:!0,"data-svelte-h":!0}),I(o)!=="svelte-1930uw2"&&(o.innerHTML=c),this.h()},h(){d(o,"class","conv-empty svelte-1o5zbdd")},m(v,z){ct(v,o,z)},p:en,d(v){v&&u(o)}}}function Vn(i){let o,c,v,z='<tr><th class="svelte-1o5zbdd">Objednávka</th> <th class="svelte-1o5zbdd">Zákazník</th> <th class="svelte-1o5zbdd">Hodnota</th> <th class="svelte-1o5zbdd">Dátum</th></tr>',y,h,V=hn(i[2]),_=[];for(let t=0;t<V.length;t+=1)_[t]=zn(pn(i,V,t));return{c(){o=r("div"),c=r("table"),v=r("thead"),v.innerHTML=z,y=b(),h=r("tbody");for(let t=0;t<_.length;t+=1)_[t].c();this.h()},l(t){o=s(t,"DIV",{class:!0});var D=p(o);c=s(D,"TABLE",{class:!0});var g=p(c);v=s(g,"THEAD",{"data-svelte-h":!0}),I(v)!=="svelte-1vard1x"&&(v.innerHTML=z),y=m(g),h=s(g,"TBODY",{});var P=p(h);for(let E=0;E<_.length;E+=1)_[E].l(P);P.forEach(u),g.forEach(u),D.forEach(u),this.h()},h(){d(c,"class","conv-table svelte-1o5zbdd"),d(o,"class","conv-table-wrap svelte-1o5zbdd")},m(t,D){ct(t,o,D),e(o,c),e(c,v),e(c,y),e(c,h);for(let g=0;g<_.length;g+=1)_[g]&&_[g].m(h,null)},p(t,D){if(D&4){V=hn(t[2]);let g;for(g=0;g<V.length;g+=1){const P=pn(t,V,g);_[g]?_[g].p(P,D):(_[g]=zn(P),_[g].c(),_[g].m(h,null))}for(;g<_.length;g+=1)_[g].d(1);_.length=V.length}},d(t){t&&u(o),Pn(_,t)}}}function zn(i){let o,c,v,z=i[26].order_id+"",y,h,V,_,t,D=(i[26].customer_name||"Neuvedené")+"",g,P,E,x=i[26].customer_email+"",q,S,M,R,L=at(i[26].order_value,2)+"",$,ae,B,O,ne=Cn(i[26].conversion_date)+"",J,j;return{c(){o=r("tr"),c=r("td"),v=r("code"),y=l(z),h=b(),V=r("td"),_=r("div"),t=r("strong"),g=l(D),P=b(),E=r("small"),q=l(x),S=b(),M=r("td"),R=r("strong"),$=l(L),ae=l(" €"),B=b(),O=r("td"),J=l(ne),j=b(),this.h()},l(N){o=s(N,"TR",{});var k=p(o);c=s(k,"TD",{class:!0});var U=p(c);v=s(U,"CODE",{class:!0});var K=p(v);y=n(K,z),K.forEach(u),U.forEach(u),h=m(k),V=s(k,"TD",{class:!0});var F=p(V);_=s(F,"DIV",{class:!0});var W=p(_);t=s(W,"STRONG",{});var ue=p(t);g=n(ue,D),ue.forEach(u),P=m(W),E=s(W,"SMALL",{class:!0});var le=p(E);q=n(le,x),le.forEach(u),W.forEach(u),F.forEach(u),S=m(k),M=s(k,"TD",{class:!0});var G=p(M);R=s(G,"STRONG",{});var _e=p(R);$=n(_e,L),ae=n(_e," €"),_e.forEach(u),G.forEach(u),B=m(k),O=s(k,"TD",{class:!0});var oe=p(O);J=n(oe,ne),oe.forEach(u),j=m(k),k.forEach(u),this.h()},h(){d(v,"class","conv-order-id svelte-1o5zbdd"),d(c,"class","svelte-1o5zbdd"),d(E,"class","svelte-1o5zbdd"),d(_,"class","conv-customer svelte-1o5zbdd"),d(V,"class","svelte-1o5zbdd"),d(M,"class","svelte-1o5zbdd"),d(O,"class","svelte-1o5zbdd")},m(N,k){ct(N,o,k),e(o,c),e(c,v),e(v,y),e(o,h),e(o,V),e(V,_),e(_,t),e(t,g),e(_,P),e(_,E),e(E,q),e(o,S),e(o,M),e(M,R),e(R,$),e(R,ae),e(o,B),e(o,O),e(O,J),e(o,j)},p(N,k){k&4&&z!==(z=N[26].order_id+"")&&ve(y,z),k&4&&D!==(D=(N[26].customer_name||"Neuvedené")+"")&&ve(g,D),k&4&&x!==(x=N[26].customer_email+"")&&ve(q,x),k&4&&L!==(L=at(N[26].order_value,2)+"")&&ve($,L),k&4&&ne!==(ne=Cn(N[26].conversion_date)+"")&&ve(J,ne)},d(N){N&&u(o)}}}function Mn(i){let o,c,v,z,y,h="✅",V,_,t,D="Celkom konverzií",g,P,E=at(i[1].total_conversions)+"",x,q,S,M,R=i[1].conversions_change+"",L,$,ae,B,O,ne="💰",J,j,N,k="Celkové tržby",U,K,F=at(i[1].total_revenue,2)+"",W,ue,le,G,_e="z konverzií",oe,Y,se,te="📊",Z,Q,C,Oe="Konverzný pomer",Re,re,fe=at(i[1].conversion_rate,1)+"",xe,Ie,Se,be,je="z klikov",Ne,me,de,Le="🛒",Be,ce,ee,he="Priem. objednávka",ke,f,Je=at(i[1].avg_order_value,2)+"",qe,Ge,rt,ge,Ve,it='<h3 class="svelte-1o5zbdd">🔧 Nastavenie merania konverzií</h3> <span class="conv-badge svelte-1o5zbdd">Dôležité</span>',Xe,H,He,Ye=`Pre správne meranie konverzií je potrebné vložiť tracking kód na vašu <strong>&quot;Thank You&quot; stránku</strong> 
                (stránka po úspešnom nákupe vo vašom e-shope).`,We,Ue,ze,Me,vt="Váš Tracking Code",Ze,Ce,pe,ie,we,Qe="📋",dt,X,w,Ke="Tracking URL",a,ut,et,Ht,_t,tn="📋",Rt,$e,tt,nn="🌐 HTML / Univerzálne",qt,nt,ln="🛒 WooCommerce",Kt,lt,on="🏪 Shoptet",$t,ot,an="📊 Google Tag Manager",Jt,Dt,Et,yt,Gt,ht,bt,sn='<h3 class="svelte-1o5zbdd">🛍️ Posledné konverzie</h3>',Xt,kt,Wt,gt,rn='<div class="conv-card-header svelte-1o5zbdd"><h3 class="svelte-1o5zbdd">💡 Ako meranie konverzií funguje?</h3></div> <div class="conv-card-body svelte-1o5zbdd"><div class="conv-steps svelte-1o5zbdd"><div class="conv-step svelte-1o5zbdd"><div class="conv-step-num svelte-1o5zbdd">1</div> <div class="conv-step-content svelte-1o5zbdd"><h4 class="svelte-1o5zbdd">Zákazník klikne</h4> <p class="svelte-1o5zbdd">Zákazník klikne na váš produkt na MegaPrice.sk a je presmerovaný na váš e-shop</p></div></div> <div class="conv-step svelte-1o5zbdd"><div class="conv-step-num svelte-1o5zbdd">2</div> <div class="conv-step-content svelte-1o5zbdd"><h4 class="svelte-1o5zbdd">Nákup vo vašom e-shope</h4> <p class="svelte-1o5zbdd">Zákazník dokončí nákup vo vašom e-shope</p></div></div> <div class="conv-step svelte-1o5zbdd"><div class="conv-step-num svelte-1o5zbdd">3</div> <div class="conv-step-content svelte-1o5zbdd"><h4 class="svelte-1o5zbdd">Tracking zaznamená konverziu</h4> <p class="svelte-1o5zbdd">Váš tracking kód odošle informáciu o úspešnom nákupe</p></div></div> <div class="conv-step svelte-1o5zbdd"><div class="conv-step-num svelte-1o5zbdd">4</div> <div class="conv-step-content svelte-1o5zbdd"><h4 class="svelte-1o5zbdd">Štatistiky &amp; ROI</h4> <p class="svelte-1o5zbdd">Vidíte presné dáta o konverziách a návratnosti investície</p></div></div></div></div>',Zt,dn,Te=i[4]&&fn(i),De=i[0]==="html"&&mn(i),Ee=i[0]==="woocommerce"&&bn(i),ye=i[0]==="shoptet"&&kn(i),Pe=i[0]==="gtm"&&gn(i);function cn(T,A){return T[2].length>0?Vn:Nn}let Pt=cn(i),Fe=Pt(i);return{c(){o=r("div"),Te&&Te.c(),c=b(),v=r("div"),z=r("div"),y=r("div"),y.textContent=h,V=b(),_=r("div"),t=r("span"),t.textContent=D,g=b(),P=r("span"),x=l(E),q=b(),S=r("span"),M=l("↑ "),L=l(R),$=l("%"),ae=b(),B=r("div"),O=r("div"),O.textContent=ne,J=b(),j=r("div"),N=r("span"),N.textContent=k,U=b(),K=r("span"),W=l(F),ue=l(" €"),le=b(),G=r("span"),G.textContent=_e,oe=b(),Y=r("div"),se=r("div"),se.textContent=te,Z=b(),Q=r("div"),C=r("span"),C.textContent=Oe,Re=b(),re=r("span"),xe=l(fe),Ie=l("%"),Se=b(),be=r("span"),be.textContent=je,Ne=b(),me=r("div"),de=r("div"),de.textContent=Le,Be=b(),ce=r("div"),ee=r("span"),ee.textContent=he,ke=b(),f=r("span"),qe=l(Je),Ge=l(" €"),rt=b(),ge=r("div"),Ve=r("div"),Ve.innerHTML=it,Xe=b(),H=r("div"),He=r("p"),He.innerHTML=Ye,We=b(),Ue=r("div"),ze=r("div"),Me=r("label"),Me.textContent=vt,Ze=b(),Ce=r("div"),pe=r("input"),ie=b(),we=r("button"),we.textContent=Qe,dt=b(),X=r("div"),w=r("label"),w.textContent=Ke,a=b(),ut=r("div"),et=r("input"),Ht=b(),_t=r("button"),_t.textContent=tn,Rt=b(),$e=r("div"),tt=r("button"),tt.textContent=nn,qt=b(),nt=r("button"),nt.textContent=ln,Kt=b(),lt=r("button"),lt.textContent=on,$t=b(),ot=r("button"),ot.textContent=an,Jt=b(),De&&De.c(),Dt=b(),Ee&&Ee.c(),Et=b(),ye&&ye.c(),yt=b(),Pe&&Pe.c(),Gt=b(),ht=r("div"),bt=r("div"),bt.innerHTML=sn,Xt=b(),kt=r("div"),Fe.c(),Wt=b(),gt=r("div"),gt.innerHTML=rn,this.h()},l(T){o=s(T,"DIV",{class:!0});var A=p(o);Te&&Te.l(A),c=m(A),v=s(A,"DIV",{class:!0});var pt=p(v);z=s(pt,"DIV",{class:!0});var It=p(z);y=s(It,"DIV",{class:!0,"data-svelte-h":!0}),I(y)!=="svelte-1fblih3"&&(y.textContent=h),V=m(It),_=s(It,"DIV",{class:!0});var zt=p(_);t=s(zt,"SPAN",{class:!0,"data-svelte-h":!0}),I(t)!=="svelte-a4yuf3"&&(t.textContent=D),g=m(zt),P=s(zt,"SPAN",{class:!0});var vn=p(P);x=n(vn,E),vn.forEach(u),q=m(zt),S=s(zt,"SPAN",{class:!0});var St=p(S);M=n(St,"↑ "),L=n(St,R),$=n(St,"%"),St.forEach(u),zt.forEach(u),It.forEach(u),ae=m(pt),B=s(pt,"DIV",{class:!0});var Nt=p(B);O=s(Nt,"DIV",{class:!0,"data-svelte-h":!0}),I(O)!=="svelte-1koekg1"&&(O.textContent=ne),J=m(Nt),j=s(Nt,"DIV",{class:!0});var Ct=p(j);N=s(Ct,"SPAN",{class:!0,"data-svelte-h":!0}),I(N)!=="svelte-1rznltn"&&(N.textContent=k),U=m(Ct),K=s(Ct,"SPAN",{class:!0});var Ft=p(K);W=n(Ft,F),ue=n(Ft," €"),Ft.forEach(u),le=m(Ct),G=s(Ct,"SPAN",{class:!0,"data-svelte-h":!0}),I(G)!=="svelte-y4m4dm"&&(G.textContent=_e),Ct.forEach(u),Nt.forEach(u),oe=m(pt),Y=s(pt,"DIV",{class:!0});var Vt=p(Y);se=s(Vt,"DIV",{class:!0,"data-svelte-h":!0}),I(se)!=="svelte-irmzqj"&&(se.textContent=te),Z=m(Vt),Q=s(Vt,"DIV",{class:!0});var Tt=p(Q);C=s(Tt,"SPAN",{class:!0,"data-svelte-h":!0}),I(C)!=="svelte-8yelx8"&&(C.textContent=Oe),Re=m(Tt),re=s(Tt,"SPAN",{class:!0});var Yt=p(re);xe=n(Yt,fe),Ie=n(Yt,"%"),Yt.forEach(u),Se=m(Tt),be=s(Tt,"SPAN",{class:!0,"data-svelte-h":!0}),I(be)!=="svelte-1ef19u3"&&(be.textContent=je),Tt.forEach(u),Vt.forEach(u),Ne=m(pt),me=s(pt,"DIV",{class:!0});var Mt=p(me);de=s(Mt,"DIV",{class:!0,"data-svelte-h":!0}),I(de)!=="svelte-koic83"&&(de.textContent=Le),Be=m(Mt),ce=s(Mt,"DIV",{class:!0});var Ot=p(ce);ee=s(Ot,"SPAN",{class:!0,"data-svelte-h":!0}),I(ee)!=="svelte-cyjtv9"&&(ee.textContent=he),ke=m(Ot),f=s(Ot,"SPAN",{class:!0});var Qt=p(f);qe=n(Qt,Je),Ge=n(Qt," €"),Qt.forEach(u),Ot.forEach(u),Mt.forEach(u),pt.forEach(u),rt=m(A),ge=s(A,"DIV",{class:!0});var jt=p(ge);Ve=s(jt,"DIV",{class:!0,"data-svelte-h":!0}),I(Ve)!=="svelte-2p5x58"&&(Ve.innerHTML=it),Xe=m(jt),H=s(jt,"DIV",{class:!0});var Ae=p(H);He=s(Ae,"P",{class:!0,"data-svelte-h":!0}),I(He)!=="svelte-140tr5n"&&(He.innerHTML=Ye),We=m(Ae),Ue=s(Ae,"DIV",{class:!0});var Lt=p(Ue);ze=s(Lt,"DIV",{class:!0});var Ut=p(ze);Me=s(Ut,"LABEL",{class:!0,"data-svelte-h":!0}),I(Me)!=="svelte-aa26lm"&&(Me.textContent=vt),Ze=m(Ut),Ce=s(Ut,"DIV",{class:!0});var wt=p(Ce);pe=s(wt,"INPUT",{type:!0,id:!0,class:!0}),ie=m(wt),we=s(wt,"BUTTON",{class:!0,"data-svelte-h":!0}),I(we)!=="svelte-14kyod0"&&(we.textContent=Qe),wt.forEach(u),Ut.forEach(u),dt=m(Lt),X=s(Lt,"DIV",{class:!0});var At=p(X);w=s(At,"LABEL",{class:!0,"data-svelte-h":!0}),I(w)!=="svelte-f6xkh0"&&(w.textContent=Ke),a=m(At),ut=s(At,"DIV",{class:!0});var xt=p(ut);et=s(xt,"INPUT",{type:!0,id:!0,class:!0}),Ht=m(xt),_t=s(xt,"BUTTON",{class:!0,"data-svelte-h":!0}),I(_t)!=="svelte-1p42uxw"&&(_t.textContent=tn),xt.forEach(u),At.forEach(u),Lt.forEach(u),Rt=m(Ae),$e=s(Ae,"DIV",{class:!0});var ft=p($e);tt=s(ft,"BUTTON",{class:!0,"data-svelte-h":!0}),I(tt)!=="svelte-kk57m5"&&(tt.textContent=nn),qt=m(ft),nt=s(ft,"BUTTON",{class:!0,"data-svelte-h":!0}),I(nt)!=="svelte-qbtos3"&&(nt.textContent=ln),Kt=m(ft),lt=s(ft,"BUTTON",{class:!0,"data-svelte-h":!0}),I(lt)!=="svelte-11nxknp"&&(lt.textContent=on),$t=m(ft),ot=s(ft,"BUTTON",{class:!0,"data-svelte-h":!0}),I(ot)!=="svelte-12av28n"&&(ot.textContent=an),ft.forEach(u),Jt=m(Ae),De&&De.l(Ae),Dt=m(Ae),Ee&&Ee.l(Ae),Et=m(Ae),ye&&ye.l(Ae),yt=m(Ae),Pe&&Pe.l(Ae),Ae.forEach(u),jt.forEach(u),Gt=m(A),ht=s(A,"DIV",{class:!0});var Bt=p(ht);bt=s(Bt,"DIV",{class:!0,"data-svelte-h":!0}),I(bt)!=="svelte-c26q0b"&&(bt.innerHTML=sn),Xt=m(Bt),kt=s(Bt,"DIV",{class:!0});var un=p(kt);Fe.l(un),un.forEach(u),Bt.forEach(u),Wt=m(A),gt=s(A,"DIV",{class:!0,"data-svelte-h":!0}),I(gt)!=="svelte-1eh8itb"&&(gt.innerHTML=rn),A.forEach(u),this.h()},h(){d(y,"class","conv-stat-icon svelte-1o5zbdd"),d(t,"class","conv-stat-label svelte-1o5zbdd"),d(P,"class","conv-stat-value svelte-1o5zbdd"),d(S,"class","conv-stat-change positive svelte-1o5zbdd"),d(_,"class","conv-stat-content svelte-1o5zbdd"),d(z,"class","conv-stat conv-stat-success svelte-1o5zbdd"),d(O,"class","conv-stat-icon svelte-1o5zbdd"),d(N,"class","conv-stat-label svelte-1o5zbdd"),d(K,"class","conv-stat-value svelte-1o5zbdd"),d(G,"class","conv-stat-note svelte-1o5zbdd"),d(j,"class","conv-stat-content svelte-1o5zbdd"),d(B,"class","conv-stat svelte-1o5zbdd"),d(se,"class","conv-stat-icon svelte-1o5zbdd"),d(C,"class","conv-stat-label svelte-1o5zbdd"),d(re,"class","conv-stat-value svelte-1o5zbdd"),d(be,"class","conv-stat-note svelte-1o5zbdd"),d(Q,"class","conv-stat-content svelte-1o5zbdd"),d(Y,"class","conv-stat svelte-1o5zbdd"),d(de,"class","conv-stat-icon svelte-1o5zbdd"),d(ee,"class","conv-stat-label svelte-1o5zbdd"),d(f,"class","conv-stat-value svelte-1o5zbdd"),d(ce,"class","conv-stat-content svelte-1o5zbdd"),d(me,"class","conv-stat svelte-1o5zbdd"),d(v,"class","conv-stats svelte-1o5zbdd"),d(Ve,"class","conv-card-header conv-card-header-warning svelte-1o5zbdd"),d(He,"class","conv-intro svelte-1o5zbdd"),d(Me,"class","svelte-1o5zbdd"),d(pe,"type","text"),pe.value=i[6],pe.readOnly=!0,d(pe,"id","tracking-code"),d(pe,"class","conv-input svelte-1o5zbdd"),d(we,"class","conv-copy-btn svelte-1o5zbdd"),d(Ce,"class","conv-input-group svelte-1o5zbdd"),d(ze,"class","conv-credential svelte-1o5zbdd"),d(w,"class","svelte-1o5zbdd"),d(et,"type","text"),et.value=i[5],et.readOnly=!0,d(et,"id","tracking-url"),d(et,"class","conv-input svelte-1o5zbdd"),d(_t,"class","conv-copy-btn svelte-1o5zbdd"),d(ut,"class","conv-input-group svelte-1o5zbdd"),d(X,"class","conv-credential svelte-1o5zbdd"),d(Ue,"class","conv-credentials svelte-1o5zbdd"),d(tt,"class","conv-tab svelte-1o5zbdd"),mt(tt,"active",i[0]==="html"),d(nt,"class","conv-tab svelte-1o5zbdd"),mt(nt,"active",i[0]==="woocommerce"),d(lt,"class","conv-tab svelte-1o5zbdd"),mt(lt,"active",i[0]==="shoptet"),d(ot,"class","conv-tab svelte-1o5zbdd"),mt(ot,"active",i[0]==="gtm"),d($e,"class","conv-tabs svelte-1o5zbdd"),d(H,"class","conv-card-body svelte-1o5zbdd"),d(ge,"class","conv-card conv-tracking-card svelte-1o5zbdd"),d(bt,"class","conv-card-header svelte-1o5zbdd"),d(kt,"class","conv-card-body svelte-1o5zbdd"),d(ht,"class","conv-card svelte-1o5zbdd"),d(gt,"class","conv-card conv-how-it-works svelte-1o5zbdd"),d(o,"class","conv-page svelte-1o5zbdd")},m(T,A){ct(T,o,A),Te&&Te.m(o,null),e(o,c),e(o,v),e(v,z),e(z,y),e(z,V),e(z,_),e(_,t),e(_,g),e(_,P),e(P,x),e(_,q),e(_,S),e(S,M),e(S,L),e(S,$),e(v,ae),e(v,B),e(B,O),e(B,J),e(B,j),e(j,N),e(j,U),e(j,K),e(K,W),e(K,ue),e(j,le),e(j,G),e(v,oe),e(v,Y),e(Y,se),e(Y,Z),e(Y,Q),e(Q,C),e(Q,Re),e(Q,re),e(re,xe),e(re,Ie),e(Q,Se),e(Q,be),e(v,Ne),e(v,me),e(me,de),e(me,Be),e(me,ce),e(ce,ee),e(ce,ke),e(ce,f),e(f,qe),e(f,Ge),e(o,rt),e(o,ge),e(ge,Ve),e(ge,Xe),e(ge,H),e(H,He),e(H,We),e(H,Ue),e(Ue,ze),e(ze,Me),e(ze,Ze),e(ze,Ce),e(Ce,pe),e(Ce,ie),e(Ce,we),e(Ue,dt),e(Ue,X),e(X,w),e(X,a),e(X,ut),e(ut,et),e(ut,Ht),e(ut,_t),e(H,Rt),e(H,$e),e($e,tt),e($e,qt),e($e,nt),e($e,Kt),e($e,lt),e($e,$t),e($e,ot),e(H,Jt),De&&De.m(H,null),e(H,Dt),Ee&&Ee.m(H,null),e(H,Et),ye&&ye.m(H,null),e(H,yt),Pe&&Pe.m(H,null),e(o,Gt),e(o,ht),e(ht,bt),e(ht,Xt),e(ht,kt),Fe.m(kt,null),e(o,Wt),e(o,gt),Zt||(dn=[st(we,"click",i[12]),st(_t,"click",i[13]),st(tt,"click",i[14]),st(nt,"click",i[15]),st(lt,"click",i[16]),st(ot,"click",i[17])],Zt=!0)},p(T,[A]){T[4]?Te?Te.p(T,A):(Te=fn(T),Te.c(),Te.m(o,c)):Te&&(Te.d(1),Te=null),A&2&&E!==(E=at(T[1].total_conversions)+"")&&ve(x,E),A&2&&R!==(R=T[1].conversions_change+"")&&ve(L,R),A&2&&F!==(F=at(T[1].total_revenue,2)+"")&&ve(W,F),A&2&&fe!==(fe=at(T[1].conversion_rate,1)+"")&&ve(xe,fe),A&2&&Je!==(Je=at(T[1].avg_order_value,2)+"")&&ve(qe,Je),A&64&&pe.value!==T[6]&&(pe.value=T[6]),A&32&&et.value!==T[5]&&(et.value=T[5]),A&1&&mt(tt,"active",T[0]==="html"),A&1&&mt(nt,"active",T[0]==="woocommerce"),A&1&&mt(lt,"active",T[0]==="shoptet"),A&1&&mt(ot,"active",T[0]==="gtm"),T[0]==="html"?De?De.p(T,A):(De=mn(T),De.c(),De.m(H,Dt)):De&&(De.d(1),De=null),T[0]==="woocommerce"?Ee?Ee.p(T,A):(Ee=bn(T),Ee.c(),Ee.m(H,Et)):Ee&&(Ee.d(1),Ee=null),T[0]==="shoptet"?ye?ye.p(T,A):(ye=kn(T),ye.c(),ye.m(H,yt)):ye&&(ye.d(1),ye=null),T[0]==="gtm"?Pe?Pe.p(T,A):(Pe=gn(T),Pe.c(),Pe.m(H,null)):Pe&&(Pe.d(1),Pe=null),Pt===(Pt=cn(T))&&Fe?Fe.p(T,A):(Fe.d(1),Fe=Pt(T),Fe&&(Fe.c(),Fe.m(kt,null)))},i:en,o:en,d(T){T&&u(o),Te&&Te.d(),De&&De.d(),Ee&&Ee.d(),ye&&ye.d(),Pe&&Pe.d(),Fe.d(),Zt=!1,Dn(dn)}}}function at(i,o=0){return(i||0).toLocaleString("sk-SK",{minimumFractionDigits:o,maximumFractionDigits:o})}function Cn(i){return new Date(i).toLocaleDateString("sk-SK",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})}function On(i,o,c){let v,z,y,h;const V=_n("shop");En(i,V,k=>c(11,h=k));const _=_n("API_BASE");let t="html",D={total_conversions:0,total_revenue:0,conversion_rate:0,avg_order_value:0,conversions_change:12.5},g=[];yn(async()=>{await P()});async function P(){const k=localStorage.getItem("vendor_token");if(k)try{const K=await(await fetch(`${_}/vendor/analytics`,{headers:{Authorization:`Bearer ${k}`}})).json();K.success&&K.data&&(c(1,D={...D,...K.data}),c(2,g=K.data.recent_conversions||[]))}catch{console.log("Analytics endpoint not available yet")}}function E(k){const U=document.getElementById(k);U&&(navigator.clipboard.writeText(U.value||U.textContent),M("Skopírované do schránky!"))}function x(k){const U=document.getElementById(k);U&&(navigator.clipboard.writeText(U.textContent),M("Kód skopírovaný!"))}let q="",S=!1;function M(k){c(3,q=k),c(4,S=!0),setTimeout(()=>c(4,S=!1),2e3)}const R=()=>E("tracking-code"),L=()=>E("tracking-url"),$=()=>c(0,t="html"),ae=()=>c(0,t="woocommerce"),B=()=>c(0,t="shoptet"),O=()=>c(0,t="gtm"),ne=()=>x("code-html"),J=()=>x("code-woo"),j=()=>x("code-shoptet"),N=()=>x("code-gtm");return i.$$.update=()=>{i.$$.dirty&2048&&c(10,v=h),i.$$.dirty&1024&&c(6,z=v!=null&&v.id?`MKP-${v.id.substring(0,8).toUpperCase()}`:"MKP-XXXXXXXX")},c(5,y=_?`${_}/track/conversion`:"https://megaprice.sk/api/v1/track/conversion"),[t,D,g,q,S,y,z,V,E,x,v,h,R,L,$,ae,B,O,ne,J,j,N]}class wn extends In{constructor(o){super(),Sn(this,o,On,Mn,Tn,{})}}export{wn as component};
