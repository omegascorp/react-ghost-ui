import React = require('react');

import clickOutsideService from '../services/clickOutsideService';
import dropDownService from '../services/dropDownService';
import settingService from '../services/settingService';
import utilService from '../services/utilService';

import AbstractComponent, {IModifiers} from './AbstractComponent';
import Icon from './Icon';
import Portal from './Portal';

export interface ISelectProps {
  placeholder?: string;
  size?: string | number;
  view?: string;
  disabled?: boolean;
  opened?: boolean;
  fixed?: boolean;
  portal?: JSX.Element[];
  options?: ISelectOption[];

  onChangeOpened?: (opened: boolean) => void;
  onChange?: (value: string, option: ISelectOption) => void;
}

export interface ISelectState {
  opened: boolean;
}

export interface ISelectOption {
  title: string;
  value: string;
}

export default class Select extends AbstractComponent<ISelectProps, ISelectState> {
  private dropDownElement: HTMLElement;
  private selectElement: HTMLElement;

  private onClickHandler: () => void;
  private onUpdateDropDownHandler: (event: Event) => void;
  private onWindowScrollHandler: () => void;
  private onUpdateSelectElementHandler: (element: HTMLElement) => void;
  private onUpdateDropDownElementHandler: (element: HTMLElement) => void;
  private onCloseHandler: () => void;

  constructor() {
    super();

    this.state = {
      opened: false,
    };

    this.onClickHandler = this.onClick.bind(this);
    this.onUpdateDropDownHandler = this.onUpdateDropDown.bind(this);
    this.onWindowScrollHandler = this.onWindowScroll.bind(this);
    this.onCloseHandler = this.onClose.bind(this);
    this.onUpdateDropDownElementHandler = this.onUpdateDropDownElement.bind(this);
    this.onUpdateSelectElementHandler = this.onUpdateSelectElement.bind(this);
  }

  componentDidMount() {
    window.addEventListener('scroll', this.onWindowScrollHandler, true);
    window.addEventListener('resize', this.onUpdateDropDownHandler, true);
    clickOutsideService.on(this.onCloseHandler);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.onWindowScrollHandler, true);
    window.removeEventListener('resize', this.onUpdateDropDownHandler, true);
    clickOutsideService.off(this.onCloseHandler);
  }

  getModifierObject(): IModifiers {
    return {
      size: this.props.size,
      view: this.props.view,
      disabled: this.props.disabled,
    };
  }

  getOptions(): ISelectOption[] {
    return this.props.options || [];
  }

  isOpened(): boolean {
    return this.props.opened || this.state.opened;
  }

  onClose() {
    this.onSetOpened(false);
  }

  onUpdateDropDownElement(element: HTMLElement) {
    this.dropDownElement = element;

    this.onUpdateDropDown();
  }

  onUpdateSelectElement(element: HTMLElement) {
    this.selectElement = element;
  }

  onClick() {
    this.onSetOpened(!this.isOpened());
  }

  onSetOpened(opened: boolean) {
    this.setState({
      opened: opened
    });

    if (this.props.onChangeOpened) {
      this.props.onChangeOpened(opened);
    }
  }

  onUpdateDropDown() {
    dropDownService.updateDropDown(this.dropDownElement, this.selectElement, this.props.fixed);
  }

  onWindowScroll() {
    if (this.isOpened()) {
      const selectElement = this.selectElement.getBoundingClientRect();

      if (selectElement.bottom < 32 || selectElement.top > window.innerHeight) {
        this.onClose();
      } else {
        this.onUpdateDropDown();
      }
    }
  }

  renderOptions() {
    return this.getOptions().map((option: ISelectOption) => {
      return (
        <div
          className={this.getElementName('select', 'option')}
          onClick={() => this.props.onChange(option.value, option)}
        >
          {option.title}
        </div>
      );
    });
  }

  render() {
    const portalKey: string = settingService.isBackend() ? utilService.generateKey() : '';

    return (
      <div
        className={this.getBlockName('select', this.getModifierObject())}
        ref={this.onUpdateSelectElementHandler}
      >
        <div
          className={this.getElementName('select', 'box')}
          onClick={this.onClickHandler}
        >
          <div>
            {this.props.placeholder}
          </div>
          <Icon width="12" rotate={this.isOpened() ? 180 : 0} name="dropDown" />
        </div>
        <Portal
          show={this.isOpened()}
          portal={this.props.portal}
          portalKey={portalKey}
        >
          <div
            className={this.getElementName('select', 'drop-down')}
            ref={this.onUpdateDropDownElementHandler}
          >
            {this.renderOptions()}
          </div>
        </Portal>
      </div>
    );
  }
}