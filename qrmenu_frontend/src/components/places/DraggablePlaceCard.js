import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import PlaceCard from './PlaceCard';

/**
 * Wrapper draggable pour PlaceCard
 */
const DraggablePlaceCard = ({ place, index, ...cardProps }) => {
  return (
    <Draggable draggableId={`place-${place.id}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
            opacity: snapshot.isDragging ? 0.8 : 1,
          }}
        >
          <PlaceCard place={place} {...cardProps} />
        </div>
      )}
    </Draggable>
  );
};

export default DraggablePlaceCard;


