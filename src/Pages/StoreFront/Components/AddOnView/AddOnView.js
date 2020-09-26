import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { useQuery } from '@apollo/react-hooks';
import _ from 'lodash';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Dialog, Box, Button, Typography } from '@material-ui/core';

import AddOnGroup from '../../../../SharedComponents/AddOnGroup';
import CloseIconButton from '../../../../SharedComponents/CloseIconButton';
import AddOnViewSkeleton from './AddOnView.skeleton';
import { formatPrice } from '../../../../utils/string';
import { getCurrency } from '../../../../utils/store';
import { getAddOnCartPrice } from '../../../../utils/product';
import { GET_PRODUCT_ADDONS } from '../../../../graphql/products/product-query';
import { updateProductCartAction } from '../../../../actions/cartAction';

const AddOnView = ({
  open,
  hideModal,
  productId,
  curProductCart,
  currencyData,
  productPrice,
  updateProductCartAction,
}) => {
  const { loading: productAddonsLoading, data: productAddons } = useQuery(GET_PRODUCT_ADDONS, {
    variables: {
      id: productId,
    },
  });

  const classes = useStyles();
  const [addonCarts, setAddonCarts] = useState([]);
  const groupRefs = useRef([]);

  const getProductAddons = () => {
    const products = _.get(productAddons, 'products', []);
    if (!products || products.length === 0) return [];
    return _.get(products[0], 'addons', []);
  };

  useEffect(() => {
    groupRefs.current = new Array(getProductAddons().length);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productAddons]);

  const changeAddOns = (groupAddOns) => {
    const findOne = addonCarts.find((item) => item.id === groupAddOns.id);
    if (findOne) {
      const addons = _.get(groupAddOns, 'addons', []);
      if (addons.length === 0) {
        setAddonCarts([...addonCarts.filter((item) => item.id !== groupAddOns.id)]);
      } else {
        setAddonCarts([
          ...addonCarts.map((item) => {
            if (item.id === groupAddOns.id)
              return {
                ...groupAddOns,
              };
            else return item;
          }),
        ]);
      }
    } else setAddonCarts([...addonCarts, groupAddOns]);
  };

  const getAddOnOptions = (groupId) => {
    const findOne = addonCarts.find((item) => item.id === groupId);
    return findOne;
  };

  const handleClickAddCart = () => {
    let validate = true;
    groupRefs.current.forEach((item) => {
      const groupValidate = item.checkValidate();
      if (!groupValidate) validate = groupValidate;
    });
    if (!validate) return;
    updateProductCartAction({
      ...curProductCart,
      addons: [...addonCarts],
    });
    hideModal();
  };

  const getAddOnPrice = () => {
    const totalPrice = getAddOnCartPrice(addonCarts, null, null) + productPrice;
    return `${getCurrency(currencyData)} ${formatPrice(totalPrice, currencyData)}`;
  };

  return (
    <Dialog open={open} onClose={hideModal} fullWidth={true} maxWidth="md" className={classes.root}>
      <CloseIconButton onClick={hideModal} wrapperClass={classes.CloseButtonWrapper} />
      {productAddonsLoading ? (
        <AddOnViewSkeleton />
      ) : (
        <>
          <Typography variant="h1" className={classes.Title}>
            Select Options
          </Typography>
          {getProductAddons().map((item, nIndex) => {
            return (
              <AddOnGroup
                key={item.id}
                productId={productId}
                groupId={item.id}
                productGroupAddonInfo={item}
                groupAddOns={getAddOnOptions(item.id)}
                setGroupAddOns={(groupAddOns) => {
                  changeAddOns(groupAddOns);
                }}
                ref={(el) => (groupRefs.current[nIndex] = el)}
              />
            );
          })}
          <Box className={classes.Footer}>
            <Typography variant="h1" className={classes.FooterPriceLabel}>
              Price:
            </Typography>
            <Typography variant="h1" className={classes.FooterPrice}>
              {getAddOnPrice()}
            </Typography>
            <Button variant="contained" color="primary" className={classes.AddCartButton} onClick={handleClickAddCart}>
              Add to cart
            </Button>
          </Box>
        </>
      )}
    </Dialog>
  );
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      '& .MuiDialog-paper': {
        padding: '50px',
        width: '100%',
        maxWidth: '1240px',
        borderRadius: '10px',
        boxShadow: '0 1px 4px 0 rgba(186, 195, 201, 0.5)',
        border: 'solid 1px rgba(186, 195, 201, 0.5)',
        backgroundColor: '#ffffff',
        position: 'relative',
        maxHeight: '80vh',
        '@media screen and (max-width: 768px)': {
          paddingLeft: '15px',
          paddingRight: '15px',
        },
        '@media screen and (max-width: 480px)': {
          padding: '35px 20px 25px',
          marginLeft: '7px',
          marginRight: '7px',
        },
      },
    },
    CloseButtonWrapper: {
      top: '15px',
      right: '15px',
    },
    Title: {
      fontWeight: 500,
    },
    Footer: {
      display: 'flex',
      boxSizing: 'border-box',
      justifyContent: 'flex-end',
      alignItems: 'center',
      margin: '47px 0 0 0',
      '@media screen and (max-width: 480px)': {
        justifyContent: 'center',
      },
    },
    FooterPriceLabel: {
      fontWeight: 300,
      color: theme.palette.primary.text,
    },
    FooterPrice: {
      color: theme.palette.primary.text,
      margin: '0 0 0 10px',
    },
    AddCartButton: {
      width: '166px',
      height: '50px',
      margin: '0 0 0 40px',
    },
  })
);
export default connect(null, { updateProductCartAction })(AddOnView);
