const DSAwardsTheme = {};

export default DSAwardsTheme;


import { createGlobalStyle } from 'styled-components';

import NovcentoSansWideLight from './../fonts/Novecentosanswide-Light.otf';
import NovcentoSansWideBold from './../fonts/Novecentosanswide-Bold.otf';
import NovcentoSansWideNormal from './../fonts/Novecentosanswide-Normal.otf';
import NovcentoSansWideBook from './../fonts/Novecentosanswide-Book.otf';

import AcuminProLight from './../fonts/AcuminPro-Light.woff';
import QuicksandRegular from './../fonts/Quicksand-Regular.ttf';
import SFCompactDisplayRegular from './../fonts/SF-Compact-Display-Regular.otf';

import ProximaNovaLight from './../fonts/Proxima Nova Light.ttf';
import ProximaNovaBold from './../fonts/Proxima Nova Bold.ttf';


const GlobalStyle = createGlobalStyle`

@font-face {
    font-family: NovcentoSansWideLight;
    src: url(${NovcentoSansWideLight}) format("opentype");
}

@font-face {
    font-family: NovcentoSansWideBold;
    src: url(${NovcentoSansWideBold}) format("opentype");
}

@font-face {
    font-family: NovcentoSansWideNormal;
    src: url(${NovcentoSansWideNormal}) format("opentype");
}

@font-face {
    font-family: NovcentoSansWideBook;
    src: url(${NovcentoSansWideBook}) format("opentype");
}


@font-face {
    font-family: AcuminProLight;
    src: url(${AcuminProLight}) format('woff');
}

@font-face {
    font-family: QuicksandRegular;
    src: url(${QuicksandRegular}) format('truetype');
}

@font-face {
    font-family: SFCompactDisplayRegular;
    src: url(${SFCompactDisplayRegular}) format('opentype');
}

@font-face {
    font-family: ProximaNovaLight;
    src: url(${SFCompactDisplayRegular}) format('opentype');
}

@font-face {
    font-family: ProximaNovaLight;
    src: url(${ProximaNovaLight}) format('truetype');
}

@font-face {
    font-family: ProximaNovaBold;
    src: url(${ProximaNovaBold}) format('truetype');
}
`;

export { GlobalStyle };
