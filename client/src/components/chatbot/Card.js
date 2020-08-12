import React from 'react';

const Card = (props) => {
    return (
        <div style={{height:270, paddingRight:10, width:270}}>
            <div className="card blue-grey darken-1">
                <div className="card-content white-text">
                    <span className="card-title">{props.payload.fields.header.stringValue}</span>
                    <p>{props.payload.fields.description.stringValue}</p>
                </div>
        <div className="card-action">
          <a targer="_blank" href={props.payload.fields.link.stringValue}>Check Now</a>
        </div>
      </div>
        </div>
    )
}

export default Card;