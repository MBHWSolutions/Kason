/**
 * @function Switcher - Wrapper component for the bootstrap Dropdown menu
 *
 * @param {array} items - the menu data, should contain:
 *    ID - unique id
 *    icon (optional) - item's icon - file name
 *    sign (optional) - item's icon - as string - the item's icon should be either icon or sign
 *    value - the value that will be passed back to the server
 * @param {object} selected - the selected item in the switcher
 * @param {string} label - a label that would be displayed next to the current selected item
 * @param {func} onSelected - the function to be called when the user clicks on an item
 */

import React, {Component} from 'react'
import {Dropdown, DropdownToggle, DropdownMenu, DropdownItem} from 'reactstrap'
import Flag from '$core-components/Flag'
import './Switcher.scss'
import Icon from './Icon'

class Switcher extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      isDropdownOpen: false,
      active: props.items && props.items.length > 1
    };
  }

  toggle() {
    if (!this.state.active) {
      return
    }

    this.setState(prevState => ({
      isDropdownOpen: !prevState.isDropdownOpen
    }));
  }

  render() {
    const {className, items, label, selected, onSelected} = this.props

    let classNameStr = 'switcher'
    classNameStr += (className) ? ` ${className}` : ''

    if (!items) {
      return <div/>
    }

    return (
      <Dropdown className={classNameStr} isOpen={this.state.isDropdownOpen} toggle={this.toggle}>
        <DropdownToggle tag="span">
          <div>
            <div className="back-block">
              <div className="back-icon-container">
                <Icon name="back.svg" width="9px" height="19px" className="back-icon" />
              </div>
              <div className="main-title">
                <div className="label-title">{label}</div>
              </div>
            </div>
            <div className="selected-block">
              {selected && selected.sign &&
              <div>
                <span className="selected-sign">{selected.value}</span>
                <span className="label-selected">&nbsp;&nbsp;{label}</span>
              </div>
              }
              {selected && selected.icon &&
              <div>
                <span className="selected-icon">
                  <Flag name={selected.icon}   width="29" height="19"/></span>
                  <span className="label-selected">&nbsp;&nbsp;{label}</span>
              </div>
              }
            </div>
          </div>
        </DropdownToggle>
        <DropdownMenu className="list">
          {
            items.map(({ID, icon, sign, value}) => {
              return (
                <DropdownItem key={ID} onClick={() => {
                  onSelected(ID)
                }}>
                  <a className="item">
                    {sign && <span className="sign">{sign}</span>}
                    {icon && <Flag name={icon} width="29" height="19" className="icon"/>}
                    <span className="name truncate">{value}</span>
                  </a>
                </DropdownItem>
              )
            })
          }
        </DropdownMenu>
      </Dropdown>
    )
  }
}

export default Switcher
