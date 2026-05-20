import { theme } from 'antd';
import React, { useMemo } from 'react';
import PhoneInput, { PhoneInputProps } from 'react-phone-input-2';

interface IProps extends PhoneInputProps {
  size?: 'small' | 'middle' | 'large';
}

const InputPhone: React.FC<IProps> = ({
  disabled = false,
  disableDropdown = false,
  autoFormat = false,
  enableSearch = true,
  disableSearchIcon = true,
  countryCodeEditable = false,
  searchPlaceholder = 'Search...',
  country = 'bd',
  size = 'middle',
  containerStyle,
  inputStyle,
  buttonStyle,
  dropdownStyle,
  searchStyle,
  ...rest
}) => {
  const { token } = theme.useToken();

  const isError = rest['aria-invalid'] === 'true';

  const styles = useMemo(() => {
    const input = {
      width: '100%',
      height: size === 'large' ? token.controlHeightLG : size === 'small' ? token.controlHeightSM : token.controlHeight,
      paddingLeft: 48,
      border: 'none',
      borderRadius:
        size === 'large' ? token.borderRadiusLG : size === 'small' ? token.borderRadiusSM : token.borderRadius,
      color: disabled ? token.colorTextDisabled : token.colorText,
      background: disabled ? token.colorBgContainerDisabled : token.colorBgContainer,
      fontSize: size === 'large' ? token.fontSizeLG : size === 'small' ? token.fontSizeSM : token.fontSize,
    };

    const button = {
      height: size === 'large' ? token.controlHeightLG : size === 'small' ? token.controlHeightSM : token.controlHeight,
      border: 'none',
      borderRadius:
        size === 'large' ? token.borderRadiusLG : size === 'small' ? token.borderRadiusSM : token.borderRadius,
      background: disabled ? token.colorBgContainerDisabled : token.colorBgContainer,
    };

    const dropdown = {
      borderRadius:
        size === 'large' ? token.borderRadiusLG : size === 'small' ? token.borderRadiusSM : token.borderRadius,
      color: disableDropdown ? token.colorTextDisabled : token.colorText,
      background: disableDropdown ? token.colorBgContainerDisabled : token.colorBgContainer,
      boxShadow: token.boxShadow,
    };

    const search = {
      width: '100%',
      height: token.controlHeight,
      marginLeft: 0,
      border: `1px solid ${token.colorBorder}`,
      borderRadius:
        size === 'large' ? token.borderRadiusLG : size === 'small' ? token.borderRadiusSM : token.borderRadius,
      color: disableDropdown ? token.colorTextDisabled : token.colorText,
      background: disableDropdown ? token.colorBgContainerDisabled : token.colorBgContainer,
    };

    return { input, button, dropdown, search };
  }, [disabled, disableDropdown, size, token]);

  return (
    <React.Fragment>
      <PhoneInput
        disabled={disabled}
        disableDropdown={disableDropdown}
        autoFormat={autoFormat}
        enableSearch={enableSearch}
        disableSearchIcon={disableSearchIcon}
        countryCodeEditable={countryCodeEditable}
        searchPlaceholder={searchPlaceholder}
        country={country}
        containerStyle={{ width: '100%', ...containerStyle }}
        inputStyle={{ ...styles.input, ...inputStyle }}
        buttonStyle={{ pointerEvents: disabled ? 'none' : 'auto', ...styles.button, ...buttonStyle }}
        dropdownStyle={{ ...styles.dropdown, ...dropdownStyle }}
        searchStyle={{ ...styles.search, ...searchStyle }}
        {...rest}
      />
      <style jsx global>{`
        .react-tel-input {
          border: 1px solid ${isError ? token.colorError : token.colorBorder} !important;
          border-radius: ${size === 'large'
            ? token.borderRadiusLG
            : size === 'small'
              ? token.borderRadiusSM
              : token.borderRadius}px !important;
          transition:
            border-color 0.2s,
            box-shadow 0.2s;

          &:hover,
          &:has(input:focus) {
            border-color: ${isError ? token.colorError : token.colorPrimary} !important;
            .flag-dropdown {
              border-color: ${isError ? token.colorError : token.colorPrimary} !important;
              transition: border-color 0.2s;
            }
          }

          &:has(input:focus) {
            box-shadow: 0 0 0 ${token.controlOutlineWidth}px ${isError ? token.colorErrorOutline : token.controlOutline} !important;
          }

          .flag-dropdown {
            border-right: 1px solid ${isError ? token.colorError : token.colorBorder} !important;

            .selected-flag {
              border-radius: ${size === 'large'
                ? token.borderRadiusLG
                : size === 'small'
                  ? token.borderRadiusSM
                  : token.borderRadius}px !important;
              background-color: ${token.colorBgContainer} !important;
            }

            .country-list {
              -ms-overflow-style: none;
              scrollbar-width: none;

              &::-webkit-scrollbar {
                display: none;
              }

              .search {
                padding: ${token.padding}px;
                background-color: ${token.colorBgContainer};
              }

              .country {
                &:hover {
                  background-color: ${token.controlItemBgHover};
                }

                &.highlight {
                  color: ${token.colorText};
                  background-color: ${token.controlItemBgActive};
                  font-weight: ${token.fontWeightStrong};
                }
              }
            }
          }
        }
      `}</style>
    </React.Fragment>
  );
};

export default InputPhone;
