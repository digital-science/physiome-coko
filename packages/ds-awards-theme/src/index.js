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

import { get } from 'lodash'


const ThemeBaseDefaults = {

    // Borders
    BorderColor: "#d0d0d0",
    BorderWidth: "1px",
    BorderStyle: "solid",

    // Inputs
    InputFontFamily: "ProximaNovaLight, sans-serif",
    InputColor: "#000",

    // Labels
    LabelFontFamily: "ProximaNovaLight, sans-serif",
    LabelColor: "#505050",

    // Text Color
    TextColor: "#505050",

    // Misc
    ButtonIconColor: "#9c9c9c",
    HoveredColor: "#505050",

    // Font Sizes
    FontSizeDefault: "16px",
    FontSizeSmall: "12px",

    // Bordered Elements
    BorderRadiusDefault: "5px",
    BorderRadiusSmall: "5px",
    BorderPaddingDefault: "12px",
    BorderPaddingSmall: "6px",

    // Content Padding
    ContentPaddingDefault: "12px",
    ContentPaddingSmall: "6px",



};

const DSAwardsTheme = {

    // Modal
    modal: {
        fontFamily: ThemeBaseDefaults.LabelFontFamily,

        headingFontSize: "20px",
        headingTextColor: ThemeBaseDefaults.LabelColor,
        headingFontWeight: "bold",

        messageFontSize: "14px",
        messageTextColor: ThemeBaseDefaults.LabelColor
    },

    helpPopover: {
        fontFamily: ThemeBaseDefaults.LabelFontFamily,
        textColor: ThemeBaseDefaults.LabelColor,
        fontSize: ThemeBaseDefaults.FontSizeSmall,
        maximumWidth: "250px"
    },

    // Label
    label: {
        fontFamily: ThemeBaseDefaults.LabelFontFamily,
        textColor: ThemeBaseDefaults.LabelColor,
        default: {
            fontSize: ThemeBaseDefaults.FontSizeDefault
        },
        small: {
            fontSize: ThemeBaseDefaults.FontSizeSmall
        }
    },

    // Input
    input: {
        fontFamily: ThemeBaseDefaults.InputFontFamily,
        textColor: ThemeBaseDefaults.InputColor,
        default: {
            fontSize: ThemeBaseDefaults.FontSizeDefault
        },
        small: {
            fontSize: ThemeBaseDefaults.FontSizeSmall
        }
    },

    // Text Input
    textInput: {
        default: {
            fontSize: ThemeBaseDefaults.FontSizeDefault
        },
        small: {
            fontSize: ThemeBaseDefaults.FontSizeSmall
        }
    },

    textArea: {
        fontFamily: ThemeBaseDefaults.InputFontFamily,
        fontSize: ThemeBaseDefaults.FontSizeDefault,
        textColor: ThemeBaseDefaults.InputColor
    },

    // Bordered Element
    borderedElement: {
        default: {
            borderWidth: ThemeBaseDefaults.BorderWidth,
            borderStyle: ThemeBaseDefaults.BorderStyle,
            borderColor: ThemeBaseDefaults.BorderColor,
            borderRadius: ThemeBaseDefaults.BorderRadiusDefault,

            padding: ThemeBaseDefaults.ContentPaddingDefault
        },
        small: {
            borderWidth: ThemeBaseDefaults.BorderWidth,
            borderStyle: ThemeBaseDefaults.BorderStyle,
            borderColor: ThemeBaseDefaults.BorderColor,
            borderRadius: ThemeBaseDefaults.BorderRadiusSmall,

            padding: ThemeBaseDefaults.ContentPaddingSmall
        }
    },

    // Card
    card: {
        border: `1px solid ${ThemeBaseDefaults.BorderColor}`,
        borderColor: ThemeBaseDefaults.BorderColor,
        dropShadow: `0 6px 10px 1px #d0d0d0d4`,
        borderRadius: ThemeBaseDefaults.BorderRadiusDefault,
        backgroundColor: "white",
        innerPadding: '10px',

        grabberColor: ThemeBaseDefaults.BorderColor,
        grabberWidth: '5px',
        grabberPadding: '5px',

        buttonColor: ThemeBaseDefaults.ButtonIconColor,
        hoverButtonColor: ThemeBaseDefaults.HoveredColor
    },

    // Author listing
    authorListing: {
        fontFamily: ThemeBaseDefaults.LabelFontFamily,
        fontSize: "14px",
        textColor: "black"
    },

    // Citation
    citation: {
        fontFamily: ThemeBaseDefaults.LabelFontFamily,
        textColor: ThemeBaseDefaults.TextColor,

        selectedBackground: "#b3e7ff"
    },

    // Tag input
    tagInput: {
        fontFamily: ThemeBaseDefaults.InputFontFamily,
        fontSize: ThemeBaseDefaults.FontSizeSmall
    }

};


const th = name => props => get(props.theme, name);


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





export default DSAwardsTheme;

export { GlobalStyle, th };
