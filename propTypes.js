import PropTypes from 'prop-types';


export const CustomDialogPropTypes = PropTypes.shape({
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  children: PropTypes.node
});

export const PaymentFormPropTypes = PropTypes.shape({
  onSave: PropTypes.func,
  onClose: PropTypes.func,
  selectedData: PropTypes.object
});


export const CustomFormPropTypes = PropTypes.shape({
  onSave: PropTypes.func,
  onClose: PropTypes.func,
  selectedData: PropTypes.object
});
export const CustomDetailsFormPropTypes = PropTypes.shape({
    onSave: PropTypes.func,
    onClose: PropTypes.func,
    selectedData: PropTypes.object
  });

  export const CreditFormPropTypes = PropTypes.shape({
    onSave: PropTypes.func,
    onClose: PropTypes.func,
    inventory: PropTypes.array
  });

  export const TablePropTypes = PropTypes.shape({
    headers: PropTypes.arrayOf(PropTypes.shape({
      key: PropTypes.string,
      label: PropTypes.string,
      renderCell: PropTypes.func
    })),
    initialData: PropTypes.array,
    loading: PropTypes.bool
  });


