import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useSelector } from 'react-redux';

import { useQuery } from '@apollo/react-hooks';
import _ from 'lodash';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Box, Typography, Grid } from '@material-ui/core';

import AddOnItem from '../AddOnItem';
import AddOnGroupSkeleton from './AddOnGroup.skeleton';

import { GET_ADDON_GROUPS } from '../../graphql/products/product-query';

const AddOnGroup = forwardRef(({ productId, groupId, productGroupAddonInfo, groupAddOns, setGroupAddOns }, ref) => {
  const classes = useStyles();

  const { orderType, cartList } = useSelector((state) => ({
    orderType: state.storeReducer.orderType,
    cartList: state.cartReducer.cartList,
  }));

  const [groupValidate, setGroupValidate] = useState({
    validate: true,
    errorMsg: '',
  });

  const { loading, data: addonGroups } = useQuery(GET_ADDON_GROUPS, {
    variables: {
      id: groupId,
    },
  });

  const getGroupInfo = () => {
    const addonGroupsTemp = _.get(addonGroups, 'addonGroups', []);
    if (!addonGroupsTemp || addonGroupsTemp.length === 0) return null;

    const tempInfo = { ...productGroupAddonInfo };
    delete tempInfo.options;

    // caluclate
    const options = productGroupAddonInfo.options;
    const addons = addonGroupsTemp[0].addons;
    const mergeAddons = _.map(addons, (item) => {
      return _.assign(item, _.find(options, ['id', item.id]));
    });

    console.log({
      ...addonGroupsTemp[0],
      ...tempInfo,
      ...productGroupAddonInfo,
      addons: [...mergeAddons],
    });

    return {
      ...addonGroupsTemp[0],
      ...tempInfo,
      ...productGroupAddonInfo,
      addons: [...mergeAddons],
    };
  };

  useEffect(() => {
    const groupInfo = getGroupInfo();
    const findProductCart = cartList.find((item) => item.id === productId && item.orderType.id === orderType.id);
    if (!groupInfo || !groupInfo.addons || groupInfo.addons.length === 0) return;
    if (!findProductCart) {
      if (_.get(groupInfo, 'default_all', false)) {
        setGroupAddOns({
          ...groupInfo,
          addons: [
            ...groupInfo.addons.map((item) => {
              return { ...item, qty: 1 };
            }),
          ],
        });
      } else {
        const filterDefault = groupInfo.addons.filter((item) => item.default);
        if (filterDefault.length > 0)
          setGroupAddOns({
            ...groupInfo,
            addons: [
              ...filterDefault.map((item) => {
                return { ...item, qty: 1 };
              }),
            ],
          });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addonGroups]);

  useImperativeHandle(ref, () => ({
    checkValidate() {
      const groupInfo = getGroupInfo();
      const groupAddons = _.get(groupInfo, 'addons', []);
      const addonCarts = _.get(groupAddOns, 'addons', []);
      let tempGroupValidate = {
        validate: true,
        errorMsg: '',
      };
      if (groupAddons && groupAddons.length > 0) {
        if (groupInfo.mandatory) {
          if (!addonCarts || addonCarts.length === 0)
            tempGroupValidate = {
              validate: false,
              errorMsg: 'Select an at least one option',
            };
        }
        if (!groupInfo.multi_selection) {
          if (addonCarts && addonCarts.length > 1)
            tempGroupValidate = {
              validate: false,
              errorMsg: 'Select only one option',
            };
        }
      }
      setGroupValidate({
        ...tempGroupValidate,
      });
      return tempGroupValidate.validate;
    },
  }));

  const getAddOnItemInfo = (optionId) => {
    const addons = _.get(groupAddOns, 'addons', []);
    return addons.find((item) => item.id === optionId);
  };

  const changeAddOnData = (newData) => {
    const addons = _.get(groupAddOns, 'addons', []);
    if (newData.qty === 0) {
      setGroupAddOns({
        ...getGroupInfo(),
        addons: [...addons.filter((item) => item.id !== newData.id)],
      });
    } else {
      const findOne = addons.find((item) => item.id === newData.id);
      if (findOne) {
        setGroupAddOns({
          ...getGroupInfo(),
          addons: [
            ...addons.map((item) => {
              if (item.id === newData.id) return newData;
              return item;
            }),
          ],
        });
      } else {
        setGroupAddOns({
          ...getGroupInfo(),
          addons: [...addons, newData],
        });
      }
    }
  };

  const getOrderedItems = () => {
    const groupInfo = getGroupInfo();
    const addons = _.get(groupInfo, 'addons', []);

    const positioned = addons.filter((item) => item.position && item.position >= 0);
    const nonPositioned = addons.filter((item) => !item.position || item.position < 0);
    return [
      ...positioned.sort((a, b) => a.position - b.position),
      ...nonPositioned.sort((a, b) => a.name.toLowerCase() - b.name.toLowerCase()),
    ];
  };

  return (
    <Box className={classes.root}>
      {loading ? (
        <AddOnGroupSkeleton />
      ) : (
        <>
          <Typography variant="h2" className="title">
            {_.get(getGroupInfo(), 'group', '')}
          </Typography>
          <Grid container spacing={3}>
            {getOrderedItems().map((item) => {
              return (
                <Grid item className={classes.AddOnGridItem} key={item.id}>
                  <AddOnItem
                    itemData={item}
                    itemCartInfo={getAddOnItemInfo(item.id)}
                    setItemCartInfo={(newData) => {
                      changeAddOnData(newData);
                    }}
                  />
                </Grid>
              );
            })}
          </Grid>
          {!groupValidate.validate && (
            <Typography variant="h4" className="error-msg">
              {groupValidate.errorMsg}
            </Typography>
          )}
        </>
      )}
    </Box>
  );
});

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      margin: '30px 0 0 0',
      position: 'relative',
      '& .title': {
        fontWeight: 500,
        margin: '0 0 20px 0',
      },
      '& .error-msg': {
        color: theme.palette.primary.red,
        margin: '5px 0 0 0',
      },
    },
    AddOnGridItem: {
      flexGrow: 0,
      maxWidth: '33.333333%',
      flexBasis: '33.333333%',
      '@media screen and (max-width: 1279px)': {
        maxWidth: '50%',
        flexBasis: '50%',
      },
      '@media screen and (max-width: 768px)': {
        maxWidth: '100%',
        flexBasis: '100%',
      },
    },
  })
);
export default AddOnGroup;
