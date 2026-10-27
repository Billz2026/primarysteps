/* Primary Steps Colouring Studio: gallery expansion, part 1 of 2.
   Hand-built, large outlined regions for younger children. */
(function(){
"use strict";
const P=(n,d)=>'<path data-part="'+n+'" d="'+d+'"/>';
const C=(n,x,y,r)=>'<circle data-part="'+n+'" cx="'+x+'" cy="'+y+'" r="'+r+'"/>';
const E=(n,x,y,rx,ry)=>'<ellipse data-part="'+n+'" cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'"/>';
const R=(n,x,y,w,h,rx=0)=>'<rect data-part="'+n+'" x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+rx+'"/>';
const D=(d)=>'<path d="'+d+'" fill="none" stroke="#273D4B" stroke-width="6" stroke-linecap="round" pointer-events="none"/>';
const art=(pieces)=>pieces.join("\n");
const more=[
{id:"dog",name:"Dog",category:"animals",art:art([
 P("tail","M551 366 Q632 342 652 282 Q682 300 663 340 Q623 404 541 407Z"),
 P("body","M273 320 Q293 271 401 273 Q521 274 542 345 L539 430 L261 430Z"),
 P("front-paw","M288 392 Q322 371 349 393 L355 449 L285 449Z"),
 P("back-paw","M464 394 Q500 374 526 402 L529 449 L461 449Z"),
 P("left-ear","M297 165 Q252 106 221 143 Q191 210 246 262 Q277 266 315 226Z"),
 P("right-ear","M499 164 Q548 109 580 148 Q610 215 551 263 Q518 266 484 226Z"),
 P("head","M278 189 Q303 112 398 112 Q502 112 519 198 Q529 283 466 320 Q395 354 329 314 Q273 273 278 189Z"),
 E("muzzle",397,276,75,48),
 P("nose","M370 251 Q396 237 421 252 Q420 271 396 279 Q374 273 370 251Z"),
 '<g fill="#273D4B" stroke="none" pointer-events="none"><circle cx="343" cy="222" r="9"/><circle cx="455" cy="222" r="9"/></g>',
 D("M397 279 L397 293 Q380 313 357 296 M397 293 Q415 312 436 296")
])},
{id:"fish",name:"Fish",category:"animals",art:art([
 P("tail","M565 268 Q651 188 700 211 Q654 271 703 338 Q625 357 563 294Z"),
 P("top-fin","M323 194 L366 132 L416 182 L451 178 L491 227Z"),
 P("bottom-fin","M353 333 L409 404 L460 341Z"),
 P("body","M146 271 Q243 144 409 175 Q530 185 592 271 Q521 368 395 367 Q239 370 146 271Z"),
 P("face","M199 221 Q258 272 203 323 Q159 295 146 271Z"),
 P("stripe-one","M331 187 Q294 270 333 356 L375 365 Q340 272 382 178Z"),
 P("stripe-two","M446 186 Q410 275 452 352 L488 338 Q463 270 488 208Z"),
 C("eye",231,258,23),
 C("bubble-large",636,133,25),C("bubble-small",684,96,15),C("bubble-tiny",626,77,9),
 '<circle cx="234" cy="258" r="9" fill="#273D4B" stroke="none" pointer-events="none"/>',
 D("M176 299 Q198 314 220 299")
])},
{id:"train",name:"Train",category:"vehicles",art:art([
 R("train-track",102,431,596,18,5),
 R("rear-carriage",108,229,255,162,22),
 R("rear-window-one",129,257,92,63,8),R("rear-window-two",240,257,94,63,8),
 P("front-carriage","M371 218 Q380 182 412 182 L595 182 Q656 182 667 249 L667 393 L371 393Z"),
 R("front-window",407,214,115,92,11),
 P("driver-window","M538 214 L600 214 Q633 215 641 256 L641 306 L538 306Z"),
 R("red-stripe",113,343,550,25,8),
 R("bumper",653,360,51,37,8),
 C("wheel-one",187,393,38),C("wheel-two",294,393,38),
 C("wheel-three",472,393,38),C("wheel-four",590,393,38),
 D("M364 353 L374 353")
])},
{id:"aeroplane",name:"Aeroplane",category:"vehicles",art:art([
 P("tail-wing","M548 272 L638 162 L681 177 L655 314Z"),
 P("far-wing","M266 264 L145 209 L122 225 L222 314Z"),
 P("airplane-body","M103 290 Q168 249 347 247 L609 247 Q674 253 704 292 Q717 308 688 327 L290 343 Q169 340 104 315 Q88 307 103 290Z"),
 P("cockpit","M116 287 Q143 263 221 258 L254 282 L232 316 L120 311Z"),
 P("main-wing","M346 296 L435 112 L479 116 L471 297 L406 367 L341 350Z"),
 P("lower-wing","M433 336 L524 403 L563 388 L507 316Z"),
 C("window-one",291,293,15),C("window-two",335,293,15),
 C("window-three",547,293,15),C("window-four",591,293,15),
 P("cloud-left","M136 419 Q111 406 129 382 Q145 372 166 382 Q182 349 211 369 Q240 366 252 388 Q273 395 264 419Z"),
 P("cloud-right","M570 146 Q551 126 574 112 Q596 105 618 121 Q639 87 664 112 Q691 103 704 129 Q726 136 717 153Z")
])},
{id:"bus",name:"Bus",category:"vehicles",art:art([
 P("bus","M126 169 Q140 139 164 139 L606 139 Q661 141 675 185 L675 403 L125 403Z"),
 R("window-one",151,174,91,105,8),R("window-two",258,174,89,105,8),
 R("window-three",365,174,90,105,8),
 R("front-window",568,175,78,130,9),
 R("door",472,175,76,225,7),
 R("side-stripe",138,316,524,23,4),
 R("bumper",112,380,577,32,8),
 R("headlight",627,348,38,26,6),
 C("wheel-a",230,411,52),C("wheel-b",566,411,52),
 C("wheel-centre-a",230,411,23),C("wheel-centre-b",566,411,23),
 D("M509 177 L509 395")
])},
{id:"sun-and-clouds",name:"Sun and Clouds",category:"nature",art:art([
 C("sun",400,206,128),
 C("left-cheek",330,248,15),C("right-cheek",467,248,15),
 P("cloud-left","M126 362 Q91 345 102 318 Q113 287 149 291 Q149 251 189 236 Q242 225 258 270 Q299 253 325 287 Q364 283 368 322 Q370 357 334 368Z"),
 P("cloud-right","M471 370 Q440 348 461 320 Q475 305 498 308 Q510 267 544 275 Q562 241 594 258 Q626 257 646 293 Q689 289 708 325 Q721 366 669 373Z"),
 '<g fill="#273D4B" stroke="none" pointer-events="none"><ellipse cx="355" cy="210" rx="9" ry="12"/><ellipse cx="446" cy="210" rx="9" ry="12"/></g>',
 D("M370 261 Q397 288 428 260 M399 52 L399 31 M281 100 L260 82 M519 100 L538 81 M247 218 L223 218 M550 218 L576 218")
])},
{id:"tree",name:"Tree",category:"nature",art:art([
 R("trunk",367,306,66,146,10),
 P("left-leaves","M193 276 Q177 223 230 185 Q245 130 310 131 Q348 91 391 140 Q441 150 438 208 Q464 266 423 305 Q358 345 301 324 Q243 351 193 276Z"),
 P("right-leaves","M367 249 Q368 191 413 159 Q460 108 504 142 Q574 135 598 197 Q656 231 606 297 Q563 349 503 320 Q439 350 394 303Z"),
 P("top-leaves","M285 170 Q277 108 330 89 Q364 51 414 86 Q455 57 498 103 Q543 102 554 157 Q554 208 492 218 Q447 241 402 223 Q342 241 301 203Z"),
 C("apple-one",301,257,23),C("apple-two",487,253,24),C("apple-three",405,169,23),
 P("grass-left","M226 450 Q259 421 292 450 L332 450 L332 462 L226 462Z"),
 P("grass-right","M461 450 Q489 425 515 450 L568 450 L568 462 L461 462Z")
])},
{id:"ladybird",name:"Ladybird",category:"nature",art:art([
 P("leaf","M164 396 Q381 468 642 363 Q525 296 369 336 Q253 341 164 396Z"),
 P("body","M237 259 Q247 171 395 172 Q545 168 555 270 Q554 362 397 375 Q247 366 237 259Z"),
 P("left-wing","M264 247 Q294 184 397 196 L396 356 Q278 352 263 292Z"),
 P("right-wing","M397 196 Q501 182 531 246 L532 291 Q517 351 402 356Z"),
 P("head","M318 204 Q316 158 355 140 Q397 113 444 144 Q480 166 478 207 Q401 239 318 204Z"),
 C("spot-left-a",326,259,22),C("spot-left-b",350,326,17),
 C("spot-right-a",470,259,22),C("spot-right-b",449,325,17),
 '<g fill="#273D4B" stroke="none" pointer-events="none"><circle cx="366" cy="167" r="7"/><circle cx="432" cy="167" r="7"/></g>',
 D("M400 181 Q409 190 418 181 M364 138 L346 110 M433 136 L450 108")
])},
{id:"teddy-bear",name:"Teddy Bear",category:"home",art:art([
 C("left-ear",308,132,68),C("right-ear",491,132,68),
 C("ear-centre-left",308,132,34),C("ear-centre-right",491,132,34),
 P("left-arm","M310 300 Q250 274 222 318 Q197 376 257 409 Q291 414 329 369Z"),
 P("right-arm","M488 300 Q552 274 581 318 Q604 379 540 409 Q500 413 474 369Z"),
 P("body","M317 293 Q401 263 483 293 Q527 326 502 420 Q463 467 398 460 Q331 467 299 416 Q274 331 317 293Z"),
 C("tummy",401,374,67),
 E("left-foot",309,448,68,39),E("right-foot",490,448,68,39),
 C("head",400,209,129),E("snout",401,258,66,42),
 P("nose","M380 243 Q401 228 420 243 Q419 258 401 265 Q382 257 380 243Z"),
 '<g fill="#273D4B" stroke="none" pointer-events="none"><circle cx="354" cy="194" r="9"/><circle cx="446" cy="194" r="9"/></g>',
 D("M401 263 L401 280 Q380 297 359 280 M401 280 Q422 297 442 280")
])},
{id:"balloon",name:"Balloon",category:"home",art:art([
 P("balloon-left","M242 90 C157 88 132 184 164 264 Q190 309 241 353 Q294 308 314 259 C343 176 329 89 242 90Z"),
 P("balloon-mid","M404 62 C310 57 291 155 321 240 Q344 303 404 348 Q468 302 490 240 C516 154 495 60 404 62Z"),
 P("balloon-right","M563 90 C475 89 458 185 488 264 Q510 310 562 353 Q611 305 630 258 C660 177 647 90 563 90Z"),
 P("knot-left","M229 339 L255 339 L265 363 L218 363Z"),
 P("knot-mid","M391 339 L417 339 L426 363 L382 363Z"),
 P("knot-right","M548 339 L573 339 L583 363 L538 363Z"),
 D("M241 365 Q272 403 259 436 Q255 455 281 475 M402 365 Q378 408 415 436 Q437 458 402 480 M561 365 Q530 403 563 436 Q581 454 561 476"),
 D("M205 149 Q189 185 202 217 M367 128 Q350 163 362 194 M526 153 Q512 184 522 215")
])}
];
const original=window.PSColouringPictures||[];
const ids=new Set(original.map(p=>p.id));
for(const p of more){
 if(ids.has(p.id))throw Error("Duplicate picture "+p.id);
 const parts=[...p.art.matchAll(/data-part="([^"]+)"/g)].map(m=>m[1]);
 if(parts.length<5)throw Error("Too few regions "+p.id);
 if(new Set(parts).size!==parts.length)throw Error("Repeated regions "+p.id);
 original.push(p);ids.add(p.id);
}
})();
