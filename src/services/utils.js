export const productTypes =
{
    DYNAMIC: 1,
    STATIC: 2,
    COMPOSITE: 5,
    KIT: 14
}


export const getIsNGProduct = (type, currentStore) => {
    switch (type) {
        case productTypes.KIT:
            return true
        case productTypes.STATIC:
            const compatibilityLevel = currentStore.Attributes && currentStore.Attributes.filter(att => att.Name = 'ThemeCompatibilityLevel')
            return compatibilityLevel && compatibilityLevel[0] && compatibilityLevel[0].Value.toString() === '1'
        default:
            return false
    }
}