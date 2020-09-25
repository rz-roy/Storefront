import React, { useState } from 'react';
import { connect } from 'react-redux';

import _ from 'lodash';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Skeleton from '@material-ui/lab/Skeleton';

import ProductView from '../../../ProductView';
import AddOnView from '../../../AddOnView';
import CartAddItemButton from '../../../../../../SharedComponents/CartAddItemButton';
import { getCurrency } from '../../../../../../utils/store';
import { getProductCart, getProductPriceInfo, getProductTotalAmount } from '../../../../../../utils/product';
import { formatPrice } from '../../../../../../utils/string';
import { updateProductCartAction } from '../../../../../../actions/cartAction';

import ProductPlaceHolderImg from '../../../../../../assets/img/product-card-placeholder.png';
import { getMeasureTypStr } from '../../../../../../utils/product';

const ProductCard = ({
  productInfo,
  currencyData,
  net_price,
  cartInfo,
  orderType,
  updateProductCartAction,
  loading,
}) => {
  const classes = useStyles();

  const [showProductView, setShowProductView] = useState(false);
  const [showAddOnView, setShowAddOnView] = useState(false);

  const getProductImage = () => {
    const imgArr = _.get(productInfo, 'images', []);
    if (imgArr.length === 0) return ProductPlaceHolderImg;
    else return imgArr[0].thumbnail || ProductPlaceHolderImg;
  };

  const renderPriceInfo = () => {
    const priceInfo = getProductPriceInfo(productInfo, orderType, net_price);
    if (!priceInfo) return '';

    if (net_price) {
      const netPriceNames = priceInfo.taxes.map((taxItem) => taxItem.name);
      const netPriceStr = netPriceNames.join(', ');

      return (
        <div className={classes.Price}>
          {getCurrency(currencyData)} {formatPrice(priceInfo.price, currencyData)}
          {netPriceNames.length > 0 && <span>+{netPriceStr}</span>}
        </div>
      );
    } else {
      let priceValue = priceInfo.price;
      let rateValue = 0;
      priceInfo.taxes.forEach((item) => {
        rateValue += item.rate;
      });
      priceValue += priceValue * (rateValue / 100);
      return (
        <div className={classes.Price}>
          {getCurrency(currencyData)} {formatPrice(priceValue, currencyData)}
        </div>
      );
    }
  };

  const getCartCount = () => {
    const productCart = getProductCart(cartInfo, productInfo.id, orderType);
    return _.get(productCart, 'qty', 0);
  };

  const updateCarts = (addNumber) => {
    updateProductCartAction({
      ...getProductCart(cartInfo, productInfo.id, orderType),
      qty: getCartCount() + addNumber,
    });
  };

  const updateStoreAddonCart = (addonCarts) => {
    const productCart = getProductCart(cartInfo, productInfo.id, orderType);
    updateProductCartAction({
      ...(productCart
        ? productCart
        : {
            productId: productInfo.id,
            name: productInfo.name,
            qty: 1,
            price: getProductTotalAmount(productInfo, orderType, net_price),
            orderType: orderType,
          }),
      addons: [...addonCarts],
    });
  };

  const getStock = () => {
    const stocks = _.get(productInfo, 'stocks', []);
    if (stocks.length === 0) return 0;
    return stocks[0].current_stock;
  };

  const getAddOnPossible = () => {
    const addOns = _.get(productInfo, 'addons', []);
    if (addOns.length > 0) return true;
    return false;
  };

  const renderQtySection = () => {
    if (productInfo.pack_qty > 1) {
      return `${productInfo.pack_qty} x ${productInfo.pack_item.measure_amount}${getMeasureTypStr(
        productInfo.pack_item.measure_type
      )}`;
    } else {
      if (!productInfo.measure_amount || !productInfo.measure_type) return '';
      if (parseInt(productInfo.measure_amount) === 1 && getMeasureTypStr(productInfo.measure_type).length === 0)
        return '';
      return `${productInfo.measure_amount}${getMeasureTypStr(productInfo.measure_type)}`;
    }
  };

  const renderBottom = () => {
    if (loading) return null;

    if (getCartCount() === 0)
      return (
        <div
          className={classes.AddCart}
          onClick={(e) => {
            if (getAddOnPossible()) {
              e.stopPropagation();
              setShowAddOnView(true);
            }
          }}
          role="button"
        >
          Add to cart
        </div>
      );
    else
      return (
        <div
          className={classes.ProductCount}
          onClick={(e) => {
            e.stopPropagation();
          }}
          role="button"
        >
          <CartAddItemButton
            onClick={(e) => {
              e.stopPropagation();
              updateCarts(-1);
            }}
            type="minus"
          />
          <div className={classes.CountValue}>{getCartCount()}</div>
          <CartAddItemButton
            onClick={(e) => {
              e.stopPropagation();
              updateCarts(1);
            }}
            type="plus"
          />
        </div>
      );
  };

  if (loading)
    return (
      <div className={classes.root}>
        <Skeleton className={classes.SkelotonProductImg} />
        <div className={classes.ProductContent}>
          <div className={classes.TopSection}>
            <div className={classes.LeftInfo}>
              <Skeleton className={classes.SkeletonTitle} animation="pulse" />
              <Skeleton className={classes.SkeltonStatus} />
            </div>
            <div className={classes.Value}>
              <Skeleton className={classes.SkeltonStatus} />
            </div>
          </div>
          <Skeleton variant="rect" height={40} />
          <div className={classes.Bottom}>
            <Skeleton width={60} style={{ marginLeft: 'auto' }} />
          </div>
        </div>
      </div>
    );

  return (
    <>
      <div
        className={classes.root}
        role="button"
        onClick={() => {
          setShowProductView(true);
        }}
      >
        <div className={classes.ProductImg} style={{ backgroundImage: `url(${getProductImage()})` }}>
          {renderQtySection().length > 0 && <div className={classes.ProductLabel}>{renderQtySection()}</div>}
        </div>
        <div className={classes.ProductContent}>
          <div className={classes.TopSection}>
            <div className={classes.LeftInfo}>
              <div className={classes.Title}>{productInfo.name}</div>
              {_.get(productInfo, 'stocked', false) && (
                <div className={classes.Status}>Code: {productInfo.bar_code}</div>
              )}
            </div>
            <div className={classes.Value}>
              {renderPriceInfo()}
              <div className={classes.Stock}>{`${getStock()} in stock`}</div>
            </div>
          </div>
          <div className={classes.Description}>{productInfo.short_description}</div>
          <div className={classes.Bottom}>{renderBottom()}</div>
        </div>
      </div>
      {showProductView && (
        <ProductView
          open={showProductView}
          hideModal={() => {
            setShowProductView(false);
          }}
          productId={productInfo.id}
          // productId="1fe204f7-3051-4aca-9543-ac47c9deea6e"
          currencyData={currencyData}
          net_price={net_price}
          showAddOnView={() => {
            setShowAddOnView(true);
          }}
        />
      )}
      {showAddOnView && (
        <AddOnView
          open={showAddOnView}
          hideModal={() => {
            setShowAddOnView(false);
          }}
          productId={productInfo.id}
          storeAddonCart={_.get(getProductCart(cartInfo, productInfo.id, orderType), 'addons', [])}
          currencyData={currencyData}
          productPrice={getProductTotalAmount(productInfo, orderType, net_price)}
          updateStoreAddonCart={updateStoreAddonCart}
        />
      )}
    </>
  );
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      padding: '5px',
      boxSizing: 'border-box',
      height: '129px',
      boxShadow: '0 1px 6px 0 rgba(0, 0, 0, 0.05)',
      border: 'solid 0.5px rgba(186, 195, 201, 0.5)',
      color: theme.palette.primary.text,
      cursor: 'pointer',
    },
    ProductImg: {
      backgroundPosition: 'center center',
      backgroundSize: 'contain',
      flex: '0 0 95px',
      display: 'flex',
      flexDirection: 'column',
      backgroundRepeat: 'no-repeat',
      position: 'relative',
      marginTop: '-5px',
      marginBottom: '-5px',
      marginLeft: '-5px',
    },
    ProductLabel: {
      position: 'absolute',
      marginTop: 'auto',
      minWidth: '38px',
      width: 'auto',
      height: '38px',
      backgroundColor: 'rgba(20, 54, 106, 0.89)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontWeight: 'normal',
      fontSize: '12px',
      bottom: '5px',
      left: '5px',
      borderRadius: '50%',
      textAlign: 'center',
      paddingLeft: '5px',
      paddingRight: '5px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
    },
    ProductContent: {
      flex: '1 1 100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '5px 17px 11px 10px',
    },
    TopSection: {
      display: 'flex',
      justifyContent: 'space-between',
    },
    LeftInfo: {
      display: 'flex',
      flexDirection: 'column',
    },
    Title: {
      fontWeight: 'normal',
      lineHeight: '20px',
      marginBottom: '4px',
      minWidth: '100px',
      fontSize: '14px',
    },
    Status: {
      fontSize: '12px',
      lineHeight: '18px',
      fontWeight: 300,
    },
    Value: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'flex-end',
      marginLeft: '15px',
      lineHeight: '18px',
      fontSize: '12px',
    },
    Price: {
      fontWeight: 'normal',
      lineHeight: '18px',
      fontSize: '14px',
      paddingTop: '2px',
      '& span': {
        fontSize: '12px',
        fontWeight: 300,
        marginLeft: '3px',
      },
    },
    Stock: {
      fontSize: '13px',
      fontWeight: 300,
      lineHeight: '18px',
    },
    Description: {
      fontSize: '12px',
      fontWeight: 300,
      lineHeight: '18px',
      margin: '5px 0 0 0',
    },
    Bottom: {
      display: 'flex',
      marginTop: 'auto',
    },
    AddCart: {
      margin: '3px 0 0 auto',
      color: theme.palette.primary.main,
      fontSize: '14px',
      fontWeight: 'normal',
      cursor: 'pointer',
      lineHeight: 'normal',
    },
    ProductCount: {
      marginLeft: 'auto',
      display: 'flex',
      alignItems: 'center',
    },
    CountValue: {
      fontSize: '20px',
      textAlign: 'center',
      width: '30px',
    },
    SkelotonProductImg: {
      flex: '0 0 95px',
      height: '100%',
      transform: 'scale(1, 1)',
    },
    SkeletonTitle: {
      width: '100px',
    },
    SkeltonStatus: {
      width: '60px',
    },
  })
);

export default connect(null, { updateProductCartAction })(ProductCard);
