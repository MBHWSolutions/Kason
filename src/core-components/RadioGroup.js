import React from 'react'
import './RadioGroup.scss'

// option:
// {
//    value: string
//    label: string
//}

const RadioGroup = (props) => {

    const { className, groupName, options, selectedValue, onChange } = props


    if (!options || options.length === 0 || !groupName) {
        return null
    }

    return <div className={` ${className} radio-group`}>
        {
            options.map((opt) => {
                return <label key={opt.value} className='radio-button'>{opt.label}
                    {opt.value === selectedValue ?
                        <input key={`input_${opt.value}`} type='radio' data-qaautomationinfo={opt.value} data-isselected={true} checked='checked' name={groupName} onChange={onChange.bind(this, opt.value, opt)} />
                        :
                        <input key={`input_${opt.value}`} type='radio' data-qaautomationinfo={opt.value} data-isselected={false} name={groupName} onChange={onChange.bind(this, opt.value, opt)} />
                    }
                    <span className='radio-checkmark'></span>
                </label>
            })
        }
    </div>

}

export default RadioGroup
