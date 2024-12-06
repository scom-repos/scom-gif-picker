import { Styles } from "@ijstech/components";

export const customCardStyle = Styles.style({
  $nest: {
    '&:hover i-label': {
      bottom: '0px !important',
      transition: 'bottom 0.2s ease-in-out'
    }
  }
})

export const customCatogeryStyle = Styles.style({
  columnCount: 4,
  columnGap: '0.5rem'
})