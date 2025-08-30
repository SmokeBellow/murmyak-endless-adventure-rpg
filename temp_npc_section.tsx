        {/* Render NPCs only in village */}
        {currentLocation === 'village' && npcs.filter(npc => {
          // For special NPCs (mage, scout, guardian), only show if explicitly visible
          if (npc.type === 'mage' || npc.type === 'scout' || npc.type === 'guardian') {
            console.log(`Filtering special NPC ${npc.name}: visible=${npc.visible}, should render=${npc.visible === true}`);
            return npc.visible === true;
          }
          // For regular NPCs, show unless explicitly hidden
          return npc.visible !== false;
        }).map(npc => {
          console.log(`Rendering NPC: ${npc.name} (${npc.type}), visible=${npc.visible}`);
          return (
            <div
              key={npc.id}
              className="absolute"
              style={{
                left: npc.position.x - 20,
                top: npc.position.y - 20,
              }}
            >
              {/* NPC name label */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-yellow-400 text-xs whitespace-nowrap font-bold">
                {npc.name}
              </div>
              
              {/* NPC sprite */}
              <div
                className="relative cursor-pointer"
                onClick={() => {
                  // Check if this is a special NPC that requires conditions
                  if (npc.type === 'mage' || npc.type === 'scout' || npc.type === 'guardian') {
                    // Only allow interaction if the NPC is visible (conditions met)
                    if (!npc.visible) {
                      return; // Block interaction for invisible special NPCs
                    }
                  }
                  
                  if (isNearNPC(npc)) onNPCInteract(npc);
                }}
              >
                <img 
                  src={
                    npc.type === 'elder' ? '/headman.png' :
                    npc.type === 'blacksmith' ? '/blacksmith.png' :
                    npc.type === 'merchant' ? '/trademan.png' :
                    '/lovable-uploads/0a5678b6-372c-4296-8aef-e92f5915a9c0.png'
                  } 
                  alt="NPC" 
                  className="w-10 h-10"
                />
                
                {/* E prompt when player is near */}
                {isNearNPC(npc) && (
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-bold animate-pulse">
                    E
                  </div>
                )}
              </div>
            </div>
          );
        })}