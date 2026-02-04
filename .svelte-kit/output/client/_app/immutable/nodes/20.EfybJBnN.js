import{s as yn,n as nn,d as _,r as Pn,a as he,x as mt,i as ct,b as e,y as st,q as d,c as s,e as b,g as f,w as N,f as n,h as r,j as m,t as l,R as fn,k as In,B as Nn,m as Sn}from"../chunks/62sxw8SM.js";import{e as mn}from"../chunks/DldpiVGX.js";import{S as Vn,i as Mn}from"../chunks/CanS3UQf.js";function bn(i,a,c){const v=i.slice();return v[26]=a[c],v}function kn(i){let a,c;return{c(){a=r("div"),c=l(i[3]),this.h()},l(v){a=s(v,"DIV",{class:!0});var y=b(a);c=n(y,i[3]),y.forEach(_),this.h()},h(){d(a,"class","conv-toast svelte-1o5zbdd")},m(v,y){ct(v,a,y),e(a,c)},p(v,y){y&8&&he(c,v[3])},d(v){v&&_(a)}}}function gn(i){let a,c,v,y="Tracking skript pre Thank You stránku",j,u,T="📋 Kopírovať kód",h,t,D,p="{",P,S,x="{",L,U,V,q,I,$,Y="}",J,B,Q="{",O,H,R="}",g,C,K="{",oe,W,ne="{",Z,ee,re="{",le,te,Oe="}",F,w,ae="{",E,Pe,de="}",ce,Le,qe="}",ie,be,He="}",Ie,Ne,ke="}",Ue,Se,pe,fe;return{c(){a=r("div"),c=r("div"),v=r("span"),v.textContent=y,j=m(),u=r("button"),u.textContent=T,h=m(),t=r("pre"),D=l(`<!-- MegaPrice.sk Conversion Tracking -->
<script>
(function() `),P=l(p),S=l(`
    var config = `),L=l(x),U=l(`
        trackingCode: '`),V=l(i[6]),q=l(`',
        trackingUrl: '`),I=l(i[5]),$=l(`'
    `),J=l(Y),B=l(`;

    // ⚠️ DÔLEŽITÉ: Nahraďte tieto hodnoty skutočnými dátami z objednávky
    var orderData = `),O=l(Q),H=l(`
        order_id: 'ORDER-12345',           // ID vašej objednávky
        customer_email: 'zakaznik@email.sk',
        customer_name: 'Ján Novák',
        order_value: 49.99                  // Celková suma objednávky v EUR
    `),g=l(R),C=l(`;

    if (orderData.order_id && orderData.customer_email) `),oe=l(K),W=l(`
        fetch(config.trackingUrl, `),Z=l(ne),ee=l(`
            method: 'POST',
            headers: `),le=l(re),te=l(" 'Content-Type': 'application/json' "),F=l(Oe),w=l(`,
            body: JSON.stringify(`),E=l(ae),Pe=l(`
                tracking_code: config.trackingCode,
                ...orderData
            `),ce=l(de),Le=l(`)
        `),ie=l(qe),be=l(`).then(r => r.json())
          .then(d => console.log('MegaPrice: Conversion tracked', d))
          .catch(e => console.error('MegaPrice: Error', e));
    `),Ie=l(He),Ne=l(`
`),Ue=l(ke),Se=l(`)();
<\/script>`),this.h()},l(ve){a=s(ve,"DIV",{class:!0});var ue=b(a);c=s(ue,"DIV",{class:!0});var se=b(c);v=s(se,"SPAN",{"data-svelte-h":!0}),N(v)!=="svelte-176l7do"&&(v.textContent=y),j=f(se),u=s(se,"BUTTON",{class:!0,"data-svelte-h":!0}),N(u)!=="svelte-ered5w"&&(u.textContent=T),se.forEach(_),h=f(ue),t=s(ue,"PRE",{id:!0,class:!0});var k=b(t);D=n(k,`<!-- MegaPrice.sk Conversion Tracking -->
<script>
(function() `),P=n(k,p),S=n(k,`
    var config = `),L=n(k,x),U=n(k,`
        trackingCode: '`),V=n(k,i[6]),q=n(k,`',
        trackingUrl: '`),I=n(k,i[5]),$=n(k,`'
    `),J=n(k,Y),B=n(k,`;

    // ⚠️ DÔLEŽITÉ: Nahraďte tieto hodnoty skutočnými dátami z objednávky
    var orderData = `),O=n(k,Q),H=n(k,`
        order_id: 'ORDER-12345',           // ID vašej objednávky
        customer_email: 'zakaznik@email.sk',
        customer_name: 'Ján Novák',
        order_value: 49.99                  // Celková suma objednávky v EUR
    `),g=n(k,R),C=n(k,`;

    if (orderData.order_id && orderData.customer_email) `),oe=n(k,K),W=n(k,`
        fetch(config.trackingUrl, `),Z=n(k,ne),ee=n(k,`
            method: 'POST',
            headers: `),le=n(k,re),te=n(k," 'Content-Type': 'application/json' "),F=n(k,Oe),w=n(k,`,
            body: JSON.stringify(`),E=n(k,ae),Pe=n(k,`
                tracking_code: config.trackingCode,
                ...orderData
            `),ce=n(k,de),Le=n(k,`)
        `),ie=n(k,qe),be=n(k,`).then(r => r.json())
          .then(d => console.log('MegaPrice: Conversion tracked', d))
          .catch(e => console.error('MegaPrice: Error', e));
    `),Ie=n(k,He),Ne=n(k,`
`),Ue=n(k,ke),Se=n(k,`)();
<\/script>`),k.forEach(_),ue.forEach(_),this.h()},h(){d(u,"class","conv-copy-btn conv-copy-btn-light svelte-1o5zbdd"),d(c,"class","conv-code-header svelte-1o5zbdd"),d(t,"id","code-html"),d(t,"class","conv-code svelte-1o5zbdd"),d(a,"class","conv-code-section svelte-1o5zbdd")},m(ve,ue){ct(ve,a,ue),e(a,c),e(c,v),e(c,j),e(c,u),e(a,h),e(a,t),e(t,D),e(t,P),e(t,S),e(t,L),e(t,U),e(t,V),e(t,q),e(t,I),e(t,$),e(t,J),e(t,B),e(t,O),e(t,H),e(t,g),e(t,C),e(t,oe),e(t,W),e(t,Z),e(t,ee),e(t,le),e(t,te),e(t,F),e(t,w),e(t,E),e(t,Pe),e(t,ce),e(t,Le),e(t,ie),e(t,be),e(t,Ie),e(t,Ne),e(t,Ue),e(t,Se),pe||(fe=st(u,"click",i[18]),pe=!0)},p(ve,ue){ue&64&&he(V,ve[6]),ue&32&&he(I,ve[5])},d(ve){ve&&_(a),pe=!1,fe()}}}function zn(i){let a,c,v,y="Pridajte do functions.php vašej témy",j,u,T="📋 Kopírovať kód",h,t,D,p="{",P,S,x,L,U,V,q="{",I,$,Y="{",J,B,Q="}",O,H,R="{",g,C,K="}",oe,W,ne="}",Z,ee,re="}",le,te,Oe;return{c(){a=r("div"),c=r("div"),v=r("span"),v.textContent=y,j=m(),u=r("button"),u.textContent=T,h=m(),t=r("pre"),D=l(`<?php
// MegaPrice.sk Conversion Tracking pre WooCommerce
add_action('woocommerce_thankyou', 'megaprice_track_conversion', 10, 1);
function megaprice_track_conversion($order_id) `),P=l(p),S=l(`
    if (!$order_id) return;
    
    $order = wc_get_order($order_id);
    if (!$order) return;
    
    $tracking_code = '`),x=l(i[6]),L=l(`';
    $tracking_url = '`),U=l(i[5]),V=l(`';
    ?>
    <script>
    fetch('<?php echo $tracking_url; ?>', `),I=l(q),$=l(`
        method: 'POST',
        headers: `),J=l(Y),B=l(" 'Content-Type': 'application/json' "),O=l(Q),H=l(`,
        body: JSON.stringify(`),g=l(R),C=l(`
            tracking_code: '<?php echo $tracking_code; ?>',
            order_id: '<?php echo $order->get_order_number(); ?>',
            customer_email: '<?php echo $order->get_billing_email(); ?>',
            customer_name: '<?php echo $order->get_billing_first_name() . " " . $order->get_billing_last_name(); ?>',
            order_value: <?php echo $order->get_total(); ?>
        `),oe=l(K),W=l(`)
    `),Z=l(ne),ee=l(`);
    <\/script>
    <?php
`),le=l(re),this.h()},l(F){a=s(F,"DIV",{class:!0});var w=b(a);c=s(w,"DIV",{class:!0});var ae=b(c);v=s(ae,"SPAN",{"data-svelte-h":!0}),N(v)!=="svelte-1jxeu93"&&(v.textContent=y),j=f(ae),u=s(ae,"BUTTON",{class:!0,"data-svelte-h":!0}),N(u)!=="svelte-m1iuc2"&&(u.textContent=T),ae.forEach(_),h=f(w),t=s(w,"PRE",{id:!0,class:!0});var E=b(t);D=n(E,`<?php
// MegaPrice.sk Conversion Tracking pre WooCommerce
add_action('woocommerce_thankyou', 'megaprice_track_conversion', 10, 1);
function megaprice_track_conversion($order_id) `),P=n(E,p),S=n(E,`
    if (!$order_id) return;
    
    $order = wc_get_order($order_id);
    if (!$order) return;
    
    $tracking_code = '`),x=n(E,i[6]),L=n(E,`';
    $tracking_url = '`),U=n(E,i[5]),V=n(E,`';
    ?>
    <script>
    fetch('<?php echo $tracking_url; ?>', `),I=n(E,q),$=n(E,`
        method: 'POST',
        headers: `),J=n(E,Y),B=n(E," 'Content-Type': 'application/json' "),O=n(E,Q),H=n(E,`,
        body: JSON.stringify(`),g=n(E,R),C=n(E,`
            tracking_code: '<?php echo $tracking_code; ?>',
            order_id: '<?php echo $order->get_order_number(); ?>',
            customer_email: '<?php echo $order->get_billing_email(); ?>',
            customer_name: '<?php echo $order->get_billing_first_name() . " " . $order->get_billing_last_name(); ?>',
            order_value: <?php echo $order->get_total(); ?>
        `),oe=n(E,K),W=n(E,`)
    `),Z=n(E,ne),ee=n(E,`);
    <\/script>
    <?php
`),le=n(E,re),E.forEach(_),w.forEach(_),this.h()},h(){d(u,"class","conv-copy-btn conv-copy-btn-light svelte-1o5zbdd"),d(c,"class","conv-code-header svelte-1o5zbdd"),d(t,"id","code-woo"),d(t,"class","conv-code svelte-1o5zbdd"),d(a,"class","conv-code-section svelte-1o5zbdd")},m(F,w){ct(F,a,w),e(a,c),e(c,v),e(c,j),e(c,u),e(a,h),e(a,t),e(t,D),e(t,P),e(t,S),e(t,x),e(t,L),e(t,U),e(t,V),e(t,I),e(t,$),e(t,J),e(t,B),e(t,O),e(t,H),e(t,g),e(t,C),e(t,oe),e(t,W),e(t,Z),e(t,ee),e(t,le),te||(Oe=st(u,"click",i[19]),te=!0)},p(F,w){w&64&&he(x,F[6]),w&32&&he(U,F[5])},d(F){F&&_(a),te=!1,Oe()}}}function Cn(i){let a,c,v,y='Pre Shoptet - vložte do "Vlastný kód na ďakovnej stránke"',j,u,T="📋 Kopírovať kód",h,t,D,p="{",P,S,x="{",L,U,V,q,I,$,Y="}",J,B,Q="{",O,H,R="{",g,C,K="}",oe,W,ne="{",Z,ee,re="}",le,te,Oe="{",F,w,ae="}",E,Pe,de="{",ce,Le,qe="}",ie,be,He="}",Ie,Ne,ke="{",Ue,Se,pe="{",fe,ve,ue="{",se,k,it="}",Je,Ve,Ge="{",Ke,Xe,rt="}",ge,Me,vt="}",We,A,Be="}",Ye,Ze,we="}",ze,je,Qe,_e,Ae=`<strong>📍 Kde nájsť v Shoptete:</strong><br/>
                        Nastavenia → Nastavenia eshopu → Vzhľad a obsah → Vlastný kód → Thank you stránka`,me,dt;return{c(){a=r("div"),c=r("div"),v=r("span"),v.textContent=y,j=m(),u=r("button"),u.textContent=T,h=m(),t=r("pre"),D=l(`<!-- MegaPrice.sk Conversion Tracking pre Shoptet -->
<script>
(function() `),P=l(p),S=l(`
    var config = `),L=l(x),U=l(`
        trackingCode: '`),V=l(i[6]),q=l(`',
        trackingUrl: '`),I=l(i[5]),$=l(`'
    `),J=l(Y),B=l(`;

    // Shoptet premenné - automaticky nahradené systémom
    var orderData = `),O=l(Q),H=l(`
        order_id: '`),g=l(R),C=l("orderCode"),oe=l(K),W=l(`',
        customer_email: '`),Z=l(ne),ee=l("customerEmail"),le=l(re),te=l(`',
        customer_name: '`),F=l(Oe),w=l("customerName"),E=l(ae),Pe=l(`',
        order_value: parseFloat('`),ce=l(de),Le=l("orderPriceWithVat"),ie=l(qe),be=l(`'.replace(',', '.'))
    `),Ie=l(He),Ne=l(`;

    if (orderData.order_id && orderData.customer_email) `),Ue=l(ke),Se=l(`
        fetch(config.trackingUrl, `),fe=l(pe),ve=l(`
            method: 'POST',
            headers: `),se=l(ue),k=l(" 'Content-Type': 'application/json' "),Je=l(it),Ve=l(`,
            body: JSON.stringify(`),Ke=l(Ge),Xe=l(`
                tracking_code: config.trackingCode,
                ...orderData
            `),ge=l(rt),Me=l(`)
        `),We=l(vt),A=l(`);
    `),Ye=l(Be),Ze=l(`
`),ze=l(we),je=l(`)();
<\/script>`),Qe=m(),_e=r("div"),_e.innerHTML=Ae,this.h()},l(G){a=s(G,"DIV",{class:!0});var X=b(a);c=s(X,"DIV",{class:!0});var Re=b(c);v=s(Re,"SPAN",{"data-svelte-h":!0}),N(v)!=="svelte-1litlh7"&&(v.textContent=y),j=f(Re),u=s(Re,"BUTTON",{class:!0,"data-svelte-h":!0}),N(u)!=="svelte-12btvj8"&&(u.textContent=T),Re.forEach(_),h=f(X),t=s(X,"PRE",{id:!0,class:!0});var o=b(t);D=n(o,`<!-- MegaPrice.sk Conversion Tracking pre Shoptet -->
<script>
(function() `),P=n(o,p),S=n(o,`
    var config = `),L=n(o,x),U=n(o,`
        trackingCode: '`),V=n(o,i[6]),q=n(o,`',
        trackingUrl: '`),I=n(o,i[5]),$=n(o,`'
    `),J=n(o,Y),B=n(o,`;

    // Shoptet premenné - automaticky nahradené systémom
    var orderData = `),O=n(o,Q),H=n(o,`
        order_id: '`),g=n(o,R),C=n(o,"orderCode"),oe=n(o,K),W=n(o,`',
        customer_email: '`),Z=n(o,ne),ee=n(o,"customerEmail"),le=n(o,re),te=n(o,`',
        customer_name: '`),F=n(o,Oe),w=n(o,"customerName"),E=n(o,ae),Pe=n(o,`',
        order_value: parseFloat('`),ce=n(o,de),Le=n(o,"orderPriceWithVat"),ie=n(o,qe),be=n(o,`'.replace(',', '.'))
    `),Ie=n(o,He),Ne=n(o,`;

    if (orderData.order_id && orderData.customer_email) `),Ue=n(o,ke),Se=n(o,`
        fetch(config.trackingUrl, `),fe=n(o,pe),ve=n(o,`
            method: 'POST',
            headers: `),se=n(o,ue),k=n(o," 'Content-Type': 'application/json' "),Je=n(o,it),Ve=n(o,`,
            body: JSON.stringify(`),Ke=n(o,Ge),Xe=n(o,`
                tracking_code: config.trackingCode,
                ...orderData
            `),ge=n(o,rt),Me=n(o,`)
        `),We=n(o,vt),A=n(o,`);
    `),Ye=n(o,Be),Ze=n(o,`
`),ze=n(o,we),je=n(o,`)();
<\/script>`),o.forEach(_),Qe=f(X),_e=s(X,"DIV",{class:!0,"data-svelte-h":!0}),N(_e)!=="svelte-y8lj0f"&&(_e.innerHTML=Ae),X.forEach(_),this.h()},h(){d(u,"class","conv-copy-btn conv-copy-btn-light svelte-1o5zbdd"),d(c,"class","conv-code-header svelte-1o5zbdd"),d(t,"id","code-shoptet"),d(t,"class","conv-code svelte-1o5zbdd"),d(_e,"class","conv-note conv-note-info svelte-1o5zbdd"),d(a,"class","conv-code-section svelte-1o5zbdd")},m(G,X){ct(G,a,X),e(a,c),e(c,v),e(c,j),e(c,u),e(a,h),e(a,t),e(t,D),e(t,P),e(t,S),e(t,L),e(t,U),e(t,V),e(t,q),e(t,I),e(t,$),e(t,J),e(t,B),e(t,O),e(t,H),e(t,g),e(t,C),e(t,oe),e(t,W),e(t,Z),e(t,ee),e(t,le),e(t,te),e(t,F),e(t,w),e(t,E),e(t,Pe),e(t,ce),e(t,Le),e(t,ie),e(t,be),e(t,Ie),e(t,Ne),e(t,Ue),e(t,Se),e(t,fe),e(t,ve),e(t,se),e(t,k),e(t,Je),e(t,Ve),e(t,Ke),e(t,Xe),e(t,ge),e(t,Me),e(t,We),e(t,A),e(t,Ye),e(t,Ze),e(t,ze),e(t,je),e(a,Qe),e(a,_e),me||(dt=st(u,"click",i[20]),me=!0)},p(G,X){X&64&&he(V,G[6]),X&32&&he(I,G[5])},d(G){G&&_(a),me=!1,dt()}}}function Tn(i){let a,c,v,y="Google Tag Manager - Custom HTML Tag",j,u,T="📋 Kopírovať kód",h,t,D,p="{",P,S,x="{",L,U,V,q,I,$,Y="}",J,B,Q="{",O,H,R="{",g,C,K="}",oe,W,ne="{",Z,ee,re="}",le,te,Oe="{",F,w,ae="}",E,Pe,de="{",ce,Le,qe="}",ie,be,He="}",Ie,Ne,ke="{",Ue,Se,pe="{",fe,ve,ue="{",se,k,it="}",Je,Ve,Ge="{",Ke,Xe,rt="}",ge,Me,vt="}",We,A,Be="}",Ye,Ze,we="}",ze,je,Qe,_e,Ae=`<strong>⚙️ Nastavenie triggeru:</strong><br/>
                        Vytvorte trigger typu &quot;Page View&quot; s podmienkou: Page Path contains &quot;thank&quot; alebo &quot;dakujeme&quot;`,me,dt;return{c(){a=r("div"),c=r("div"),v=r("span"),v.textContent=y,j=m(),u=r("button"),u.textContent=T,h=m(),t=r("pre"),D=l(`<script>
// MegaPrice.sk Conversion Tracking - GTM
(function() `),P=l(p),S=l(`
    var config = `),L=l(x),U=l(`
        trackingCode: '`),V=l(i[6]),q=l(`',
        trackingUrl: '`),I=l(i[5]),$=l(`'
    `),J=l(Y),B=l(`;

    // Použite dataLayer premenné z vášho GTM
    var orderData = `),O=l(Q),H=l(`
        order_id: `),g=l(R),C=l("transactionId"),oe=l(K),W=l(`,
        customer_email: `),Z=l(ne),ee=l("customerEmail"),le=l(re),te=l(`,
        customer_name: `),F=l(Oe),w=l("customerName"),E=l(ae),Pe=l(`,
        order_value: `),ce=l(de),Le=l("transactionTotal"),ie=l(qe),be=l(`
    `),Ie=l(He),Ne=l(`;

    if (orderData.order_id && orderData.customer_email) `),Ue=l(ke),Se=l(`
        fetch(config.trackingUrl, `),fe=l(pe),ve=l(`
            method: 'POST',
            headers: `),se=l(ue),k=l(" 'Content-Type': 'application/json' "),Je=l(it),Ve=l(`,
            body: JSON.stringify(`),Ke=l(Ge),Xe=l(`
                tracking_code: config.trackingCode,
                ...orderData
            `),ge=l(rt),Me=l(`)
        `),We=l(vt),A=l(`);
    `),Ye=l(Be),Ze=l(`
`),ze=l(we),je=l(`)();
<\/script>`),Qe=m(),_e=r("div"),_e.innerHTML=Ae,this.h()},l(G){a=s(G,"DIV",{class:!0});var X=b(a);c=s(X,"DIV",{class:!0});var Re=b(c);v=s(Re,"SPAN",{"data-svelte-h":!0}),N(v)!=="svelte-ltbkr9"&&(v.textContent=y),j=f(Re),u=s(Re,"BUTTON",{class:!0,"data-svelte-h":!0}),N(u)!=="svelte-149y757"&&(u.textContent=T),Re.forEach(_),h=f(X),t=s(X,"PRE",{id:!0,class:!0});var o=b(t);D=n(o,`<script>
// MegaPrice.sk Conversion Tracking - GTM
(function() `),P=n(o,p),S=n(o,`
    var config = `),L=n(o,x),U=n(o,`
        trackingCode: '`),V=n(o,i[6]),q=n(o,`',
        trackingUrl: '`),I=n(o,i[5]),$=n(o,`'
    `),J=n(o,Y),B=n(o,`;

    // Použite dataLayer premenné z vášho GTM
    var orderData = `),O=n(o,Q),H=n(o,`
        order_id: `),g=n(o,R),C=n(o,"transactionId"),oe=n(o,K),W=n(o,`,
        customer_email: `),Z=n(o,ne),ee=n(o,"customerEmail"),le=n(o,re),te=n(o,`,
        customer_name: `),F=n(o,Oe),w=n(o,"customerName"),E=n(o,ae),Pe=n(o,`,
        order_value: `),ce=n(o,de),Le=n(o,"transactionTotal"),ie=n(o,qe),be=n(o,`
    `),Ie=n(o,He),Ne=n(o,`;

    if (orderData.order_id && orderData.customer_email) `),Ue=n(o,ke),Se=n(o,`
        fetch(config.trackingUrl, `),fe=n(o,pe),ve=n(o,`
            method: 'POST',
            headers: `),se=n(o,ue),k=n(o," 'Content-Type': 'application/json' "),Je=n(o,it),Ve=n(o,`,
            body: JSON.stringify(`),Ke=n(o,Ge),Xe=n(o,`
                tracking_code: config.trackingCode,
                ...orderData
            `),ge=n(o,rt),Me=n(o,`)
        `),We=n(o,vt),A=n(o,`);
    `),Ye=n(o,Be),Ze=n(o,`
`),ze=n(o,we),je=n(o,`)();
<\/script>`),o.forEach(_),Qe=f(X),_e=s(X,"DIV",{class:!0,"data-svelte-h":!0}),N(_e)!=="svelte-19cewsh"&&(_e.innerHTML=Ae),X.forEach(_),this.h()},h(){d(u,"class","conv-copy-btn conv-copy-btn-light svelte-1o5zbdd"),d(c,"class","conv-code-header svelte-1o5zbdd"),d(t,"id","code-gtm"),d(t,"class","conv-code svelte-1o5zbdd"),d(_e,"class","conv-note conv-note-info svelte-1o5zbdd"),d(a,"class","conv-code-section svelte-1o5zbdd")},m(G,X){ct(G,a,X),e(a,c),e(c,v),e(c,j),e(c,u),e(a,h),e(a,t),e(t,D),e(t,P),e(t,S),e(t,L),e(t,U),e(t,V),e(t,q),e(t,I),e(t,$),e(t,J),e(t,B),e(t,O),e(t,H),e(t,g),e(t,C),e(t,oe),e(t,W),e(t,Z),e(t,ee),e(t,le),e(t,te),e(t,F),e(t,w),e(t,E),e(t,Pe),e(t,ce),e(t,Le),e(t,ie),e(t,be),e(t,Ie),e(t,Ne),e(t,Ue),e(t,Se),e(t,fe),e(t,ve),e(t,se),e(t,k),e(t,Je),e(t,Ve),e(t,Ke),e(t,Xe),e(t,ge),e(t,Me),e(t,We),e(t,A),e(t,Ye),e(t,Ze),e(t,ze),e(t,je),e(a,Qe),e(a,_e),me||(dt=st(u,"click",i[21]),me=!0)},p(G,X){X&64&&he(V,G[6]),X&32&&he(I,G[5])},d(G){G&&_(a),me=!1,dt()}}}function jn(i){let a,c='<div class="conv-empty-icon svelte-1o5zbdd">📊</div> <h4 class="svelte-1o5zbdd">Zatiaľ žiadne konverzie</h4> <p class="svelte-1o5zbdd">Po nastavení tracking kódu sa tu zobrazia vaše konverzie</p>';return{c(){a=r("div"),a.innerHTML=c,this.h()},l(v){a=s(v,"DIV",{class:!0,"data-svelte-h":!0}),N(a)!=="svelte-1930uw2"&&(a.innerHTML=c),this.h()},h(){d(a,"class","conv-empty svelte-1o5zbdd")},m(v,y){ct(v,a,y)},p:nn,d(v){v&&_(a)}}}function On(i){let a,c,v,y='<tr><th class="svelte-1o5zbdd">Objednávka</th> <th class="svelte-1o5zbdd">Zákazník</th> <th class="svelte-1o5zbdd">Hodnota</th> <th class="svelte-1o5zbdd">Dátum</th></tr>',j,u,T=mn(i[2]),h=[];for(let t=0;t<T.length;t+=1)h[t]=Dn(bn(i,T,t));return{c(){a=r("div"),c=r("table"),v=r("thead"),v.innerHTML=y,j=m(),u=r("tbody");for(let t=0;t<h.length;t+=1)h[t].c();this.h()},l(t){a=s(t,"DIV",{class:!0});var D=b(a);c=s(D,"TABLE",{class:!0});var p=b(c);v=s(p,"THEAD",{"data-svelte-h":!0}),N(v)!=="svelte-1vard1x"&&(v.innerHTML=y),j=f(p),u=s(p,"TBODY",{});var P=b(u);for(let S=0;S<h.length;S+=1)h[S].l(P);P.forEach(_),p.forEach(_),D.forEach(_),this.h()},h(){d(c,"class","conv-table svelte-1o5zbdd"),d(a,"class","conv-table-wrap svelte-1o5zbdd")},m(t,D){ct(t,a,D),e(a,c),e(c,v),e(c,j),e(c,u);for(let p=0;p<h.length;p+=1)h[p]&&h[p].m(u,null)},p(t,D){if(D&4){T=mn(t[2]);let p;for(p=0;p<T.length;p+=1){const P=bn(t,T,p);h[p]?h[p].p(P,D):(h[p]=Dn(P),h[p].c(),h[p].m(u,null))}for(;p<h.length;p+=1)h[p].d(1);h.length=T.length}},d(t){t&&_(a),Sn(h,t)}}}function Dn(i){let a,c,v,y=i[26].order_id+"",j,u,T,h,t,D=(i[26].customer_name||"Neuvedené")+"",p,P,S,x=i[26].customer_email+"",L,U,V,q,I=at(i[26].order_value,2)+"",$,Y,J,B,Q=En(i[26].conversion_date)+"",O,H;return{c(){a=r("tr"),c=r("td"),v=r("code"),j=l(y),u=m(),T=r("td"),h=r("div"),t=r("strong"),p=l(D),P=m(),S=r("small"),L=l(x),U=m(),V=r("td"),q=r("strong"),$=l(I),Y=l(" €"),J=m(),B=r("td"),O=l(Q),H=m(),this.h()},l(R){a=s(R,"TR",{});var g=b(a);c=s(g,"TD",{class:!0});var C=b(c);v=s(C,"CODE",{class:!0});var K=b(v);j=n(K,y),K.forEach(_),C.forEach(_),u=f(g),T=s(g,"TD",{class:!0});var oe=b(T);h=s(oe,"DIV",{class:!0});var W=b(h);t=s(W,"STRONG",{});var ne=b(t);p=n(ne,D),ne.forEach(_),P=f(W),S=s(W,"SMALL",{class:!0});var Z=b(S);L=n(Z,x),Z.forEach(_),W.forEach(_),oe.forEach(_),U=f(g),V=s(g,"TD",{class:!0});var ee=b(V);q=s(ee,"STRONG",{});var re=b(q);$=n(re,I),Y=n(re," €"),re.forEach(_),ee.forEach(_),J=f(g),B=s(g,"TD",{class:!0});var le=b(B);O=n(le,Q),le.forEach(_),H=f(g),g.forEach(_),this.h()},h(){d(v,"class","conv-order-id svelte-1o5zbdd"),d(c,"class","svelte-1o5zbdd"),d(S,"class","svelte-1o5zbdd"),d(h,"class","conv-customer svelte-1o5zbdd"),d(T,"class","svelte-1o5zbdd"),d(V,"class","svelte-1o5zbdd"),d(B,"class","svelte-1o5zbdd")},m(R,g){ct(R,a,g),e(a,c),e(c,v),e(v,j),e(a,u),e(a,T),e(T,h),e(h,t),e(t,p),e(h,P),e(h,S),e(S,L),e(a,U),e(a,V),e(V,q),e(q,$),e(q,Y),e(a,J),e(a,B),e(B,O),e(a,H)},p(R,g){g&4&&y!==(y=R[26].order_id+"")&&he(j,y),g&4&&D!==(D=(R[26].customer_name||"Neuvedené")+"")&&he(p,D),g&4&&x!==(x=R[26].customer_email+"")&&he(L,x),g&4&&I!==(I=at(R[26].order_value,2)+"")&&he($,I),g&4&&Q!==(Q=En(R[26].conversion_date)+"")&&he(O,Q)},d(R){R&&_(a)}}}function Ln(i){let a,c,v,y='<h1 class="svelte-1o5zbdd">✅ Konverzie &amp; Meranie</h1> <p class="svelte-1o5zbdd">Nastavte tracking konverzií a sledujte úspešné predaje z MegaPrice.sk</p>',j,u,T,h,t="✅",D,p,P,S="Celkom konverzií",x,L,U=at(i[1].total_conversions)+"",V,q,I,$,Y=i[1].conversions_change+"",J,B,Q,O,H,R="💰",g,C,K,oe="Celkové tržby",W,ne,Z=at(i[1].total_revenue,2)+"",ee,re,le,te,Oe="z konverzií",F,w,ae,E="📊",Pe,de,ce,Le="Konverzný pomer",qe,ie,be=at(i[1].conversion_rate,1)+"",He,Ie,Ne,ke,Ue="z klikov",Se,pe,fe,ve="🛒",ue,se,k,it="Priem. objednávka",Je,Ve,Ge=at(i[1].avg_order_value,2)+"",Ke,Xe,rt,ge,Me,vt='<h3 class="svelte-1o5zbdd">🔧 Nastavenie merania konverzií</h3> <span class="conv-badge svelte-1o5zbdd">Dôležité</span>',We,A,Be,Ye=`Pre správne meranie konverzií je potrebné vložiť tracking kód na vašu <strong>&quot;Thank You&quot; stránku</strong> 
                (stránka po úspešnom nákupe vo vašom e-shope).`,Ze,we,ze,je,Qe="Váš Tracking Code",_e,Ae,me,dt,G,X="📋",Re,o,bt,ln="Tracking URL",Rt,ut,et,qt,_t,on="📋",Kt,$e,tt,an="🌐 HTML / Univerzálne",$t,nt,sn="🛒 WooCommerce",Jt,lt,rn="🏪 Shoptet",Gt,ot,dn="📊 Google Tag Manager",Xt,Et,yt,Pt,Wt,ht,kt,cn='<h3 class="svelte-1o5zbdd">🛍️ Posledné konverzie</h3>',Zt,gt,Ft,zt,vn='<div class="conv-card-header svelte-1o5zbdd"><h3 class="svelte-1o5zbdd">💡 Ako meranie konverzií funguje?</h3></div> <div class="conv-card-body svelte-1o5zbdd"><div class="conv-steps svelte-1o5zbdd"><div class="conv-step svelte-1o5zbdd"><div class="conv-step-num svelte-1o5zbdd">1</div> <div class="conv-step-content svelte-1o5zbdd"><h4 class="svelte-1o5zbdd">Zákazník klikne</h4> <p class="svelte-1o5zbdd">Zákazník klikne na váš produkt na MegaPrice.sk a je presmerovaný na váš e-shop</p></div></div> <div class="conv-step svelte-1o5zbdd"><div class="conv-step-num svelte-1o5zbdd">2</div> <div class="conv-step-content svelte-1o5zbdd"><h4 class="svelte-1o5zbdd">Nákup vo vašom e-shope</h4> <p class="svelte-1o5zbdd">Zákazník dokončí nákup vo vašom e-shope</p></div></div> <div class="conv-step svelte-1o5zbdd"><div class="conv-step-num svelte-1o5zbdd">3</div> <div class="conv-step-content svelte-1o5zbdd"><h4 class="svelte-1o5zbdd">Tracking zaznamená konverziu</h4> <p class="svelte-1o5zbdd">Váš tracking kód odošle informáciu o úspešnom nákupe</p></div></div> <div class="conv-step svelte-1o5zbdd"><div class="conv-step-num svelte-1o5zbdd">4</div> <div class="conv-step-content svelte-1o5zbdd"><h4 class="svelte-1o5zbdd">Štatistiky &amp; ROI</h4> <p class="svelte-1o5zbdd">Vidíte presné dáta o konverziách a návratnosti investície</p></div></div></div></div>',Yt,un,Ce=i[4]&&kn(i),Te=i[0]==="html"&&gn(i),De=i[0]==="woocommerce"&&zn(i),Ee=i[0]==="shoptet"&&Cn(i),ye=i[0]==="gtm"&&Tn(i);function _n(z,M){return z[2].length>0?On:jn}let It=_n(i),Fe=It(i);return{c(){a=r("div"),Ce&&Ce.c(),c=m(),v=r("div"),v.innerHTML=y,j=m(),u=r("div"),T=r("div"),h=r("div"),h.textContent=t,D=m(),p=r("div"),P=r("span"),P.textContent=S,x=m(),L=r("span"),V=l(U),q=m(),I=r("span"),$=l("↑ "),J=l(Y),B=l("%"),Q=m(),O=r("div"),H=r("div"),H.textContent=R,g=m(),C=r("div"),K=r("span"),K.textContent=oe,W=m(),ne=r("span"),ee=l(Z),re=l(" €"),le=m(),te=r("span"),te.textContent=Oe,F=m(),w=r("div"),ae=r("div"),ae.textContent=E,Pe=m(),de=r("div"),ce=r("span"),ce.textContent=Le,qe=m(),ie=r("span"),He=l(be),Ie=l("%"),Ne=m(),ke=r("span"),ke.textContent=Ue,Se=m(),pe=r("div"),fe=r("div"),fe.textContent=ve,ue=m(),se=r("div"),k=r("span"),k.textContent=it,Je=m(),Ve=r("span"),Ke=l(Ge),Xe=l(" €"),rt=m(),ge=r("div"),Me=r("div"),Me.innerHTML=vt,We=m(),A=r("div"),Be=r("p"),Be.innerHTML=Ye,Ze=m(),we=r("div"),ze=r("div"),je=r("label"),je.textContent=Qe,_e=m(),Ae=r("div"),me=r("input"),dt=m(),G=r("button"),G.textContent=X,Re=m(),o=r("div"),bt=r("label"),bt.textContent=ln,Rt=m(),ut=r("div"),et=r("input"),qt=m(),_t=r("button"),_t.textContent=on,Kt=m(),$e=r("div"),tt=r("button"),tt.textContent=an,$t=m(),nt=r("button"),nt.textContent=sn,Jt=m(),lt=r("button"),lt.textContent=rn,Gt=m(),ot=r("button"),ot.textContent=dn,Xt=m(),Te&&Te.c(),Et=m(),De&&De.c(),yt=m(),Ee&&Ee.c(),Pt=m(),ye&&ye.c(),Wt=m(),ht=r("div"),kt=r("div"),kt.innerHTML=cn,Zt=m(),gt=r("div"),Fe.c(),Ft=m(),zt=r("div"),zt.innerHTML=vn,this.h()},l(z){a=s(z,"DIV",{class:!0});var M=b(a);Ce&&Ce.l(M),c=f(M),v=s(M,"DIV",{class:!0,"data-svelte-h":!0}),N(v)!=="svelte-1vijjx3"&&(v.innerHTML=y),j=f(M),u=s(M,"DIV",{class:!0});var pt=b(u);T=s(pt,"DIV",{class:!0});var Nt=b(T);h=s(Nt,"DIV",{class:!0,"data-svelte-h":!0}),N(h)!=="svelte-1fblih3"&&(h.textContent=t),D=f(Nt),p=s(Nt,"DIV",{class:!0});var Ct=b(p);P=s(Ct,"SPAN",{class:!0,"data-svelte-h":!0}),N(P)!=="svelte-a4yuf3"&&(P.textContent=S),x=f(Ct),L=s(Ct,"SPAN",{class:!0});var hn=b(L);V=n(hn,U),hn.forEach(_),q=f(Ct),I=s(Ct,"SPAN",{class:!0});var St=b(I);$=n(St,"↑ "),J=n(St,Y),B=n(St,"%"),St.forEach(_),Ct.forEach(_),Nt.forEach(_),Q=f(pt),O=s(pt,"DIV",{class:!0});var Vt=b(O);H=s(Vt,"DIV",{class:!0,"data-svelte-h":!0}),N(H)!=="svelte-1koekg1"&&(H.textContent=R),g=f(Vt),C=s(Vt,"DIV",{class:!0});var Tt=b(C);K=s(Tt,"SPAN",{class:!0,"data-svelte-h":!0}),N(K)!=="svelte-1rznltn"&&(K.textContent=oe),W=f(Tt),ne=s(Tt,"SPAN",{class:!0});var Qt=b(ne);ee=n(Qt,Z),re=n(Qt," €"),Qt.forEach(_),le=f(Tt),te=s(Tt,"SPAN",{class:!0,"data-svelte-h":!0}),N(te)!=="svelte-y4m4dm"&&(te.textContent=Oe),Tt.forEach(_),Vt.forEach(_),F=f(pt),w=s(pt,"DIV",{class:!0});var Mt=b(w);ae=s(Mt,"DIV",{class:!0,"data-svelte-h":!0}),N(ae)!=="svelte-irmzqj"&&(ae.textContent=E),Pe=f(Mt),de=s(Mt,"DIV",{class:!0});var Dt=b(de);ce=s(Dt,"SPAN",{class:!0,"data-svelte-h":!0}),N(ce)!=="svelte-8yelx8"&&(ce.textContent=Le),qe=f(Dt),ie=s(Dt,"SPAN",{class:!0});var en=b(ie);He=n(en,be),Ie=n(en,"%"),en.forEach(_),Ne=f(Dt),ke=s(Dt,"SPAN",{class:!0,"data-svelte-h":!0}),N(ke)!=="svelte-1ef19u3"&&(ke.textContent=Ue),Dt.forEach(_),Mt.forEach(_),Se=f(pt),pe=s(pt,"DIV",{class:!0});var jt=b(pe);fe=s(jt,"DIV",{class:!0,"data-svelte-h":!0}),N(fe)!=="svelte-koic83"&&(fe.textContent=ve),ue=f(jt),se=s(jt,"DIV",{class:!0});var Ot=b(se);k=s(Ot,"SPAN",{class:!0,"data-svelte-h":!0}),N(k)!=="svelte-cyjtv9"&&(k.textContent=it),Je=f(Ot),Ve=s(Ot,"SPAN",{class:!0});var tn=b(Ve);Ke=n(tn,Ge),Xe=n(tn," €"),tn.forEach(_),Ot.forEach(_),jt.forEach(_),pt.forEach(_),rt=f(M),ge=s(M,"DIV",{class:!0});var Lt=b(ge);Me=s(Lt,"DIV",{class:!0,"data-svelte-h":!0}),N(Me)!=="svelte-2p5x58"&&(Me.innerHTML=vt),We=f(Lt),A=s(Lt,"DIV",{class:!0});var xe=b(A);Be=s(xe,"P",{class:!0,"data-svelte-h":!0}),N(Be)!=="svelte-140tr5n"&&(Be.innerHTML=Ye),Ze=f(xe),we=s(xe,"DIV",{class:!0});var Ut=b(we);ze=s(Ut,"DIV",{class:!0});var wt=b(ze);je=s(wt,"LABEL",{class:!0,"data-svelte-h":!0}),N(je)!=="svelte-aa26lm"&&(je.textContent=Qe),_e=f(wt),Ae=s(wt,"DIV",{class:!0});var At=b(Ae);me=s(At,"INPUT",{type:!0,id:!0,class:!0}),dt=f(At),G=s(At,"BUTTON",{class:!0,"data-svelte-h":!0}),N(G)!=="svelte-14kyod0"&&(G.textContent=X),At.forEach(_),wt.forEach(_),Re=f(Ut),o=s(Ut,"DIV",{class:!0});var xt=b(o);bt=s(xt,"LABEL",{class:!0,"data-svelte-h":!0}),N(bt)!=="svelte-f6xkh0"&&(bt.textContent=ln),Rt=f(xt),ut=s(xt,"DIV",{class:!0});var Ht=b(ut);et=s(Ht,"INPUT",{type:!0,id:!0,class:!0}),qt=f(Ht),_t=s(Ht,"BUTTON",{class:!0,"data-svelte-h":!0}),N(_t)!=="svelte-1p42uxw"&&(_t.textContent=on),Ht.forEach(_),xt.forEach(_),Ut.forEach(_),Kt=f(xe),$e=s(xe,"DIV",{class:!0});var ft=b($e);tt=s(ft,"BUTTON",{class:!0,"data-svelte-h":!0}),N(tt)!=="svelte-kk57m5"&&(tt.textContent=an),$t=f(ft),nt=s(ft,"BUTTON",{class:!0,"data-svelte-h":!0}),N(nt)!=="svelte-qbtos3"&&(nt.textContent=sn),Jt=f(ft),lt=s(ft,"BUTTON",{class:!0,"data-svelte-h":!0}),N(lt)!=="svelte-11nxknp"&&(lt.textContent=rn),Gt=f(ft),ot=s(ft,"BUTTON",{class:!0,"data-svelte-h":!0}),N(ot)!=="svelte-12av28n"&&(ot.textContent=dn),ft.forEach(_),Xt=f(xe),Te&&Te.l(xe),Et=f(xe),De&&De.l(xe),yt=f(xe),Ee&&Ee.l(xe),Pt=f(xe),ye&&ye.l(xe),xe.forEach(_),Lt.forEach(_),Wt=f(M),ht=s(M,"DIV",{class:!0});var Bt=b(ht);kt=s(Bt,"DIV",{class:!0,"data-svelte-h":!0}),N(kt)!=="svelte-c26q0b"&&(kt.innerHTML=cn),Zt=f(Bt),gt=s(Bt,"DIV",{class:!0});var pn=b(gt);Fe.l(pn),pn.forEach(_),Bt.forEach(_),Ft=f(M),zt=s(M,"DIV",{class:!0,"data-svelte-h":!0}),N(zt)!=="svelte-1eh8itb"&&(zt.innerHTML=vn),M.forEach(_),this.h()},h(){d(v,"class","conv-header svelte-1o5zbdd"),d(h,"class","conv-stat-icon svelte-1o5zbdd"),d(P,"class","conv-stat-label svelte-1o5zbdd"),d(L,"class","conv-stat-value svelte-1o5zbdd"),d(I,"class","conv-stat-change positive svelte-1o5zbdd"),d(p,"class","conv-stat-content svelte-1o5zbdd"),d(T,"class","conv-stat conv-stat-success svelte-1o5zbdd"),d(H,"class","conv-stat-icon svelte-1o5zbdd"),d(K,"class","conv-stat-label svelte-1o5zbdd"),d(ne,"class","conv-stat-value svelte-1o5zbdd"),d(te,"class","conv-stat-note svelte-1o5zbdd"),d(C,"class","conv-stat-content svelte-1o5zbdd"),d(O,"class","conv-stat svelte-1o5zbdd"),d(ae,"class","conv-stat-icon svelte-1o5zbdd"),d(ce,"class","conv-stat-label svelte-1o5zbdd"),d(ie,"class","conv-stat-value svelte-1o5zbdd"),d(ke,"class","conv-stat-note svelte-1o5zbdd"),d(de,"class","conv-stat-content svelte-1o5zbdd"),d(w,"class","conv-stat svelte-1o5zbdd"),d(fe,"class","conv-stat-icon svelte-1o5zbdd"),d(k,"class","conv-stat-label svelte-1o5zbdd"),d(Ve,"class","conv-stat-value svelte-1o5zbdd"),d(se,"class","conv-stat-content svelte-1o5zbdd"),d(pe,"class","conv-stat svelte-1o5zbdd"),d(u,"class","conv-stats svelte-1o5zbdd"),d(Me,"class","conv-card-header conv-card-header-warning svelte-1o5zbdd"),d(Be,"class","conv-intro svelte-1o5zbdd"),d(je,"class","svelte-1o5zbdd"),d(me,"type","text"),me.value=i[6],me.readOnly=!0,d(me,"id","tracking-code"),d(me,"class","conv-input svelte-1o5zbdd"),d(G,"class","conv-copy-btn svelte-1o5zbdd"),d(Ae,"class","conv-input-group svelte-1o5zbdd"),d(ze,"class","conv-credential svelte-1o5zbdd"),d(bt,"class","svelte-1o5zbdd"),d(et,"type","text"),et.value=i[5],et.readOnly=!0,d(et,"id","tracking-url"),d(et,"class","conv-input svelte-1o5zbdd"),d(_t,"class","conv-copy-btn svelte-1o5zbdd"),d(ut,"class","conv-input-group svelte-1o5zbdd"),d(o,"class","conv-credential svelte-1o5zbdd"),d(we,"class","conv-credentials svelte-1o5zbdd"),d(tt,"class","conv-tab svelte-1o5zbdd"),mt(tt,"active",i[0]==="html"),d(nt,"class","conv-tab svelte-1o5zbdd"),mt(nt,"active",i[0]==="woocommerce"),d(lt,"class","conv-tab svelte-1o5zbdd"),mt(lt,"active",i[0]==="shoptet"),d(ot,"class","conv-tab svelte-1o5zbdd"),mt(ot,"active",i[0]==="gtm"),d($e,"class","conv-tabs svelte-1o5zbdd"),d(A,"class","conv-card-body svelte-1o5zbdd"),d(ge,"class","conv-card conv-tracking-card svelte-1o5zbdd"),d(kt,"class","conv-card-header svelte-1o5zbdd"),d(gt,"class","conv-card-body svelte-1o5zbdd"),d(ht,"class","conv-card svelte-1o5zbdd"),d(zt,"class","conv-card conv-how-it-works svelte-1o5zbdd"),d(a,"class","conv-page svelte-1o5zbdd")},m(z,M){ct(z,a,M),Ce&&Ce.m(a,null),e(a,c),e(a,v),e(a,j),e(a,u),e(u,T),e(T,h),e(T,D),e(T,p),e(p,P),e(p,x),e(p,L),e(L,V),e(p,q),e(p,I),e(I,$),e(I,J),e(I,B),e(u,Q),e(u,O),e(O,H),e(O,g),e(O,C),e(C,K),e(C,W),e(C,ne),e(ne,ee),e(ne,re),e(C,le),e(C,te),e(u,F),e(u,w),e(w,ae),e(w,Pe),e(w,de),e(de,ce),e(de,qe),e(de,ie),e(ie,He),e(ie,Ie),e(de,Ne),e(de,ke),e(u,Se),e(u,pe),e(pe,fe),e(pe,ue),e(pe,se),e(se,k),e(se,Je),e(se,Ve),e(Ve,Ke),e(Ve,Xe),e(a,rt),e(a,ge),e(ge,Me),e(ge,We),e(ge,A),e(A,Be),e(A,Ze),e(A,we),e(we,ze),e(ze,je),e(ze,_e),e(ze,Ae),e(Ae,me),e(Ae,dt),e(Ae,G),e(we,Re),e(we,o),e(o,bt),e(o,Rt),e(o,ut),e(ut,et),e(ut,qt),e(ut,_t),e(A,Kt),e(A,$e),e($e,tt),e($e,$t),e($e,nt),e($e,Jt),e($e,lt),e($e,Gt),e($e,ot),e(A,Xt),Te&&Te.m(A,null),e(A,Et),De&&De.m(A,null),e(A,yt),Ee&&Ee.m(A,null),e(A,Pt),ye&&ye.m(A,null),e(a,Wt),e(a,ht),e(ht,kt),e(ht,Zt),e(ht,gt),Fe.m(gt,null),e(a,Ft),e(a,zt),Yt||(un=[st(G,"click",i[12]),st(_t,"click",i[13]),st(tt,"click",i[14]),st(nt,"click",i[15]),st(lt,"click",i[16]),st(ot,"click",i[17])],Yt=!0)},p(z,[M]){z[4]?Ce?Ce.p(z,M):(Ce=kn(z),Ce.c(),Ce.m(a,c)):Ce&&(Ce.d(1),Ce=null),M&2&&U!==(U=at(z[1].total_conversions)+"")&&he(V,U),M&2&&Y!==(Y=z[1].conversions_change+"")&&he(J,Y),M&2&&Z!==(Z=at(z[1].total_revenue,2)+"")&&he(ee,Z),M&2&&be!==(be=at(z[1].conversion_rate,1)+"")&&he(He,be),M&2&&Ge!==(Ge=at(z[1].avg_order_value,2)+"")&&he(Ke,Ge),M&64&&me.value!==z[6]&&(me.value=z[6]),M&32&&et.value!==z[5]&&(et.value=z[5]),M&1&&mt(tt,"active",z[0]==="html"),M&1&&mt(nt,"active",z[0]==="woocommerce"),M&1&&mt(lt,"active",z[0]==="shoptet"),M&1&&mt(ot,"active",z[0]==="gtm"),z[0]==="html"?Te?Te.p(z,M):(Te=gn(z),Te.c(),Te.m(A,Et)):Te&&(Te.d(1),Te=null),z[0]==="woocommerce"?De?De.p(z,M):(De=zn(z),De.c(),De.m(A,yt)):De&&(De.d(1),De=null),z[0]==="shoptet"?Ee?Ee.p(z,M):(Ee=Cn(z),Ee.c(),Ee.m(A,Pt)):Ee&&(Ee.d(1),Ee=null),z[0]==="gtm"?ye?ye.p(z,M):(ye=Tn(z),ye.c(),ye.m(A,null)):ye&&(ye.d(1),ye=null),It===(It=_n(z))&&Fe?Fe.p(z,M):(Fe.d(1),Fe=It(z),Fe&&(Fe.c(),Fe.m(gt,null)))},i:nn,o:nn,d(z){z&&_(a),Ce&&Ce.d(),Te&&Te.d(),De&&De.d(),Ee&&Ee.d(),ye&&ye.d(),Fe.d(),Yt=!1,Pn(un)}}}function at(i,a=0){return(i||0).toLocaleString("sk-SK",{minimumFractionDigits:a,maximumFractionDigits:a})}function En(i){return new Date(i).toLocaleDateString("sk-SK",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})}function Un(i,a,c){let v,y,j,u;const T=fn("shop");In(i,T,g=>c(11,u=g));const h=fn("API_BASE");let t="html",D={total_conversions:0,total_revenue:0,conversion_rate:0,avg_order_value:0,conversions_change:12.5},p=[];Nn(async()=>{await P()});async function P(){const g=localStorage.getItem("vendor_token");if(g)try{const K=await(await fetch(`${h}/vendor/analytics`,{headers:{Authorization:`Bearer ${g}`}})).json();K.success&&K.data&&(c(1,D={...D,...K.data}),c(2,p=K.data.recent_conversions||[]))}catch{console.log("Analytics endpoint not available yet")}}function S(g){const C=document.getElementById(g);C&&(navigator.clipboard.writeText(C.value||C.textContent),V("Skopírované do schránky!"))}function x(g){const C=document.getElementById(g);C&&(navigator.clipboard.writeText(C.textContent),V("Kód skopírovaný!"))}let L="",U=!1;function V(g){c(3,L=g),c(4,U=!0),setTimeout(()=>c(4,U=!1),2e3)}const q=()=>S("tracking-code"),I=()=>S("tracking-url"),$=()=>c(0,t="html"),Y=()=>c(0,t="woocommerce"),J=()=>c(0,t="shoptet"),B=()=>c(0,t="gtm"),Q=()=>x("code-html"),O=()=>x("code-woo"),H=()=>x("code-shoptet"),R=()=>x("code-gtm");return i.$$.update=()=>{i.$$.dirty&2048&&c(10,v=u),i.$$.dirty&1024&&c(6,y=v!=null&&v.id?`MKP-${v.id.substring(0,8).toUpperCase()}`:"MKP-XXXXXXXX")},c(5,j=h?`${h}/track/conversion`:"https://megaprice.sk/api/v1/track/conversion"),[t,D,p,L,U,j,y,T,S,x,v,u,q,I,$,Y,J,B,Q,O,H,R]}class Hn extends Vn{constructor(a){super(),Mn(this,a,Un,Ln,yn,{})}}export{Hn as component};
