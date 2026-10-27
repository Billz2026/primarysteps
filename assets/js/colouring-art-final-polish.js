/* Primary Steps — final premium colouring artwork polish.
   Five child-friendly, hand-drawn SVG scenes. Picture IDs and saved artwork are preserved.
   Keep each data-part independently colourable for Tap Colour.
*/
(function(){
"use strict";
const P=(name,d)=>'<path data-part="'+name+'" d="'+d+'"/>';
const C=(name,x,y,r)=>'<circle data-part="'+name+'" cx="'+x+'" cy="'+y+'" r="'+r+'"/>';
const E=(name,x,y,rx,ry)=>'<ellipse data-part="'+name+'" cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'"/>';
const R=(name,x,y,w,h,rx=0)=>'<rect data-part="'+name+'" x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+rx+'"/>';
const L=d=>'<path d="'+d+'" fill="none" stroke="#273D4B" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" pointer-events="none"/>';
const Dot=(x,y,r=7)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="#273D4B" stroke="none" pointer-events="none"/>';
const A=(...parts)=>parts.join("\n");

const redraws={
 unicorn:A(
  P("tail","M537 304 C604 277 635 239 628 190 C672 219 671 276 637 307 C650 313 665 318 681 314 C653 365 602 392 543 369Z"),
  P("back-leg","M484 365 L543 359 Q553 401 537 447 L538 464 L486 464Z"),
  P("front-leg","M311 358 L369 367 Q378 403 366 446 L369 463 L310 463Z"),
  P("body","M282 327 C300 286 341 269 420 267 C511 267 558 298 560 354 C558 396 514 419 455 421 L349 419 C298 410 269 377 282 327Z"),
  P("neck","M313 317 C289 284 285 235 310 192 C322 170 342 160 366 173 L398 301 L375 355Z"),
  P("back-mane","M336 156 C300 132 265 145 251 175 C223 170 215 208 235 225 C222 262 249 286 264 293 C263 335 308 333 337 306 L359 219Z"),
  P("ear","M328 163 Q307 125 323 94 Q354 103 372 152Z"),
  P("horn","M365 149 L384 61 Q389 45 396 62 L425 149Z"),
  P("head","M312 170 C329 133 365 129 406 139 C449 147 469 174 487 186 L522 201 Q546 215 528 242 C507 266 474 254 455 250 C428 275 389 279 350 261 C304 241 291 201 312 170Z"),
  P("muzzle","M444 207 Q486 193 517 209 Q543 222 523 246 Q494 268 448 246 Q430 233 444 207Z"),
  P("front-mane","M335 150 C357 112 386 123 399 144 C427 127 447 147 435 168 C423 183 407 193 391 190 C384 210 362 220 344 207 C327 216 312 207 316 188Z"),
  P("forelock","M394 142 Q412 116 441 132 Q451 158 422 172 Q403 175 394 160Z"),
  P("hoof-left","M302 439 L372 439 L374 466 L300 466 Q291 451 302 439Z"),
  P("hoof-right","M481 440 L547 440 L550 466 L482 466Z"),
  E("cheek",457,222,12,9),
  Dot(412,190,7),
  L("M486 238 Q505 247 519 233 M344 200 Q354 208 362 201")
 ),
 dragon:A(
  P("tail","M506 375 C556 365 611 379 623 341 C630 321 623 306 607 291 C653 292 686 330 676 372 C668 415 609 442 518 425Z"),
  P("tail-tip","M614 327 L657 271 Q660 306 686 325 Q668 340 649 354Z"),
  P("wing-left","M348 315 C294 240 269 197 224 176 Q228 232 203 260 L170 270 Q214 302 226 339 Q280 320 348 353Z"),
  P("wing-left-patch","M251 252 Q293 264 332 330 L258 319 Q244 280 227 275Z"),
  P("wing-right","M458 313 C519 232 548 189 595 176 Q592 223 616 257 L646 274 Q607 304 590 338 Q530 324 462 353Z"),
  P("wing-right-patch","M552 246 Q514 264 473 327 L559 323 Q571 288 589 269Z"),
  P("left-foot","M308 409 Q327 390 369 402 L370 450 Q360 468 342 465 L302 465 Q290 445 308 409Z"),
  P("right-foot","M449 406 Q483 391 500 408 L508 465 L451 465Z"),
  P("back-spikes","M330 313 L336 279 L359 295 L375 262 L398 285 L423 258 L446 296 L468 275 L477 320Z"),
  P("dragon-body","M311 316 C325 272 361 262 406 262 Q476 264 507 319 C529 358 520 424 477 448 Q405 480 335 447 Q284 416 311 316Z"),
  E("tummy",407,377,68,64),
  P("horn-left","M331 168 Q300 126 306 106 Q343 113 363 149Z"),
  P("horn-right","M457 152 Q486 111 508 120 Q519 145 474 178Z"),
  P("head","M314 203 C312 154 354 129 402 131 Q474 127 495 184 C509 210 513 241 491 261 Q465 296 405 301 Q341 297 311 268 C293 247 299 219 314 203Z"),
  P("snout","M358 240 Q395 222 451 238 Q484 246 477 272 Q466 303 408 309 C359 308 329 282 358 240Z"),
  E("eye-left",357,206,13,17),
  E("eye-right",458,205,13,17),
  C("nostril-left",390,273,6),
  C("nostril-right",429,273,6),
  L("M374 289 Q404 305 443 289")
 ),
 "pirate-ship":A(
  P("cloud","M130 168 Q116 147 143 132 Q165 121 185 139 Q206 109 240 134 Q272 129 289 165 Q301 189 268 190 L162 190 Q140 188 130 168Z"),
  C("sun",650,139,36),
  P("wave-left","M81 420 Q135 402 187 420 T294 420 L294 455 L81 455Z"),
  P("wave-right","M507 421 Q567 397 623 420 Q666 434 718 416 L718 455 L507 455Z"),
  P("hull","M130 333 Q259 353 404 354 Q549 353 673 327 Q643 414 567 431 Q405 464 248 430 Q173 409 130 333Z"),
  P("hull-stripe","M167 360 Q397 404 629 358 L608 382 Q400 423 197 386Z"),
  C("porthole-one",280,390,24),C("porthole-two",406,406,23),C("porthole-three",531,389,24),
  P("ship-rail","M149 310 Q399 325 643 310 L658 342 Q404 357 140 338Z"),
  R("mast",392,102,18,224,6),
  P("crow-nest","M355 166 L449 166 L439 191 L366 191Z"),
  P("left-sail","M376 187 Q290 215 269 304 L376 304Z"),
  P("right-sail","M426 180 Q526 198 552 301 L426 301Z"),
  P("top-sail","M375 104 Q322 117 311 159 L375 159Z"),
  P("top-flag","M408 90 Q451 72 506 93 L480 112 L507 134 Q452 118 408 141Z"),
  C("flag-face",454,104,14),
  C("flag-eye-left",449,102,3.7),C("flag-eye-right",459,102,3.7),
  P("anchor-emblem","M588 356 Q598 366 597 378 Q606 382 615 374 L611 391 Q597 401 587 393 Q576 401 560 389 L559 372 Q568 383 580 378 Q582 367 588 356Z"),
  L("M649 89 L648 77 M706 143 L723 143 M590 139 L573 139")
 ),
 castle:A(
  P("castle-path","M350 419 L449 419 Q472 447 497 478 L297 478 Q321 445 350 419Z"),
  P("central-building","M267 266 Q401 246 534 266 L534 440 L267 440Z"),
  P("left-tower","M161 214 Q209 195 259 214 L259 437 L161 437Z"),
  P("right-tower","M541 214 Q590 195 641 214 L641 437 L541 437Z"),
  P("left-roof","M145 213 Q171 154 206 103 Q215 91 224 103 Q258 154 278 213Z"),
  P("right-roof","M522 213 Q547 152 582 103 Q592 91 600 103 Q634 152 659 213Z"),
  P("middle-roof","M270 269 Q332 177 399 145 Q463 180 530 270Z"),
  R("left-tower-window",187,260,48,77,24),
  R("right-tower-window",562,260,48,77,24),
  R("upper-window",373,273,54,77,26),
  P("door","M341 441 L341 381 C341 303 458 302 458 382 L458 441Z"),
  C("door-knob",435,406,7),
  P("left-battlement","M158 219 L158 197 L174 197 L174 206 L193 206 L193 196 L211 196 L211 206 L229 206 L229 196 L247 196 L247 218Z"),
  P("right-battlement","M540 219 L540 197 L557 197 L557 206 L575 206 L575 196 L593 196 L593 206 L611 206 L611 196 L629 196 L629 218Z"),
  R("flagpole",395,85,10,70,5),
  P("flag","M407 91 Q449 73 490 96 L468 115 L490 133 Q447 123 407 142Z"),
  P("bush-left","M116 442 Q107 417 134 406 Q137 381 164 385 Q187 362 209 392 Q235 390 243 419 Q254 446 216 447Z"),
  P("bush-right","M561 443 Q549 418 572 400 Q598 388 609 400 Q633 372 654 397 Q691 391 693 426 Q697 445 660 447Z")
 ),
 "fire-engine":A(
  P("truck-bed","M105 245 Q107 221 131 221 L412 221 Q435 222 435 247 L435 393 L105 393Z"),
  P("cab","M432 253 Q436 231 460 226 L568 222 Q617 227 644 278 L673 314 L673 393 L432 393Z"),
  R("equipment-panel",137,260,174,91,12),
  C("hose-reel",354,301,38),
  C("hose-centre",354,301,15),
  P("cab-window","M476 253 L562 253 Q605 260 621 304 L475 304Z"),
  P("door","M453 317 L619 317 L619 390 L453 390Z"),
  P("siren-base","M558 208 L632 208 L632 222 L558 222Z"),
  P("siren","M577 206 L577 187 Q596 159 615 187 L615 206Z"),
  R("ladder-rail-upper",144,176,251,13,5),
  R("ladder-rail-lower",144,207,251,13,5),
  ...[171,201,231,261,291,321,351].map((x,i)=>R("ladder-rung-"+(i+1),x,186,12,22,3)),
  P("truck-stripe","M111 351 L430 351 L430 367 L111 367Z"),
  P("front-grille","M620 343 L666 343 L666 372 L620 372Z"),
  C("front-light",641,323,12),
  C("wheel-a",217,394,53),C("wheel-b",552,394,53),
  C("rim-a",217,394,21),C("rim-b",552,394,21),
  L("M472 315 L470 385 M466 330 L480 330")
 )
};
const registry=window.PSColouringPictures;
if(!Array.isArray(registry))throw new Error("Colouring pictures must load before artwork polish");
for(const [id,art] of Object.entries(redraws)){
 const picture=registry.find(item=>item.id===id);
 if(!picture)throw new Error("Missing picture "+id);
 const parts=[...art.matchAll(/data-part="([^"]+)"/g)].map(match=>match[1]);
 if(parts.length<12||new Set(parts).size!==parts.length)throw new Error("Invalid colour regions: "+id);
 picture.art=art;
}
})();