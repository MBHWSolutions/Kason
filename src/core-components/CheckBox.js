import './CheckBox.scss'

const CheckBox = (props) => {

    const { label, checked, className } = props

    return (
        <div>
            <label className={`checkbox ${className}`}>{label}
                {checked ?
                    <input type="checkbox" checked="checked" />
                    :
                    <input type="checkbox" />
                }
                <span className="checkmark"></span>
            </label>
        </div>
    )

}

export default CheckBox