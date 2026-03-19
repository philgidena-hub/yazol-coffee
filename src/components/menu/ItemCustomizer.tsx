"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import type { MenuItem, MenuItemSize, MenuItemOption, CartItem } from "@/lib/types";
import { getProductImage } from "@/lib/image-map";
import { generateCartKey } from "@/lib/cart-context";

interface ItemCustomizerProps {
  item: MenuItem;
  open: boolean;
  onClose: () => void;
  onAddToCart: (cartItem: CartItem) => void;
}

export default function ItemCustomizer({ item, open, onClose, onAddToCart }: ItemCustomizerProps) {
  const hasSizes = item.sizes && item.sizes.length > 0;
  const hasOptions = item.optionGroups && item.optionGroups.length > 0;

  const [selectedSize, setSelectedSize] = useState<MenuItemSize | undefined>(
    hasSizes ? item.sizes![0] : undefined
  );
  const [selectedOptions, setSelectedOptions] = useState<Record<string, MenuItemOption[]>>({});
  const [allergyNotes, setAllergyNotes] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Validation: check required groups
  const validation = useMemo(() => {
    if (!item.optionGroups) return { valid: true, errors: [] as string[] };
    const errors: string[] = [];
    for (const group of item.optionGroups) {
      if (group.required && (!selectedOptions[group.name] || selectedOptions[group.name].length === 0)) {
        errors.push(group.name);
      }
    }
    return { valid: errors.length === 0, errors };
  }, [item.optionGroups, selectedOptions]);

  // Calculate total price
  const unitPrice = useMemo(() => {
    let price = selectedSize?.price ?? item.price;
    for (const opts of Object.values(selectedOptions)) {
      for (const opt of opts) {
        price += opt.priceAdd;
      }
    }
    return price;
  }, [selectedSize, selectedOptions, item.price]);

  const totalPrice = unitPrice * quantity;

  const handleOptionToggle = (groupName: string, option: MenuItemOption, maxChoices: number) => {
    setSelectedOptions((prev) => {
      const current = prev[groupName] || [];
      const exists = current.find((o) => o.name === option.name);

      if (exists) {
        // Deselect
        const filtered = current.filter((o) => o.name !== option.name);
        return { ...prev, [groupName]: filtered };
      }

      if (maxChoices === 1) {
        // Radio behavior
        return { ...prev, [groupName]: [option] };
      }

      // Multi-select
      if (current.length >= maxChoices) return prev;
      return { ...prev, [groupName]: [...current, option] };
    });
  };

  const handleAdd = () => {
    if (!validation.valid) return;

    const cartKey = generateCartKey(
      item.slug,
      selectedSize?.name,
      selectedOptions
    );

    const cartItem: CartItem = {
      menuItem: item,
      quantity,
      allergyNotes,
      cartKey,
      selection: {
        selectedSize,
        selectedOptions: Object.keys(selectedOptions).length > 0 ? selectedOptions : undefined,
      },
    };

    onAddToCart(cartItem);
    onClose();

    // Reset for next open
    setSelectedSize(hasSizes ? item.sizes![0] : undefined);
    setSelectedOptions({});
    setAllergyNotes("");
    setQuantity(1);
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-[100]"
      />

      {/* Modal */}
      <div
        className="fixed z-[101] inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center"
      >
        <div
          className="bg-white rounded-t-3xl sm:rounded-2xl max-h-[90vh] sm:max-h-[85vh] sm:max-w-md sm:w-full overflow-hidden"
        >
            <div className="overflow-y-auto max-h-[90vh] sm:max-h-[85vh]">
              {/* Image */}
              <div className="relative h-48 sm:h-56">
                <Image
                  src={getProductImage(item.slug)}
                  alt={item.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 420px"
                  className="object-cover"
                />
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-brown hover:bg-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="px-5 sm:px-6 pt-5 pb-4">
                <h2 className="font-display text-xl text-brown">{item.name}</h2>
                <p className="text-gold font-display text-lg mt-1">
                  {hasSizes ? `From $${item.sizes![0].price.toFixed(2)}` : `$${item.price.toFixed(2)}`}
                </p>
                <p className="text-brown/50 font-body text-sm mt-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Sizes */}
              {hasSizes && (
                <div className="px-5 sm:px-6 pb-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display text-base text-brown">Size</h3>
                    <span className="text-xs font-body font-semibold text-white bg-brown rounded-full px-2.5 py-0.5">
                      Required
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {item.sizes!.map((size) => {
                      const isSelected = selectedSize?.name === size.name;
                      return (
                        <button
                          key={size.name}
                          onClick={() => setSelectedSize(size)}
                          className={`py-3 px-2 rounded-xl border text-center transition-all ${
                            isSelected
                              ? "border-gold bg-gold/5 shadow-sm"
                              : "border-black/10 hover:border-black/20"
                          }`}
                        >
                          <span className={`block font-body text-sm ${isSelected ? "text-brown font-medium" : "text-brown/70"}`}>
                            {size.name}
                          </span>
                          <span className={`block font-body text-xs mt-0.5 ${isSelected ? "text-gold" : "text-brown/40"}`}>
                            ${size.price.toFixed(2)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Option Groups */}
              {hasOptions && item.optionGroups!.map((group) => {
                const selected = selectedOptions[group.name] || [];
                const isRadio = group.maxChoices === 1;
                const hasError = validation.errors.includes(group.name);

                return (
                  <div key={group.name} className="px-5 sm:px-6 pb-5">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-display text-base text-brown">{group.name}</h3>
                        <p className="text-brown/40 font-body text-xs mt-0.5">
                          Choose {isRadio ? "1" : `up to ${group.maxChoices}`}
                        </p>
                      </div>
                      {group.required && (
                        <span className={`text-xs font-body font-semibold rounded-full px-2.5 py-0.5 ${
                          hasError ? "text-red-600 bg-red-50 border border-red-200" : "text-white bg-brown"
                        }`}>
                          Required
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      {group.options.map((option) => {
                        const isSelected = selected.some((o) => o.name === option.name);
                        return (
                          <button
                            key={option.name}
                            onClick={() => handleOptionToggle(group.name, option, group.maxChoices)}
                            className={`w-full flex items-center justify-between py-3 px-4 rounded-xl border transition-all ${
                              isSelected
                                ? "border-gold bg-gold/5"
                                : "border-black/5 hover:border-black/10"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {/* Radio or checkbox indicator */}
                              <div className={`w-5 h-5 rounded-${isRadio ? "full" : "md"} border-2 flex items-center justify-center transition-colors ${
                                isSelected ? "border-gold bg-gold" : "border-black/20"
                              }`}>
                                {isSelected && (
                                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                              <span className={`font-body text-sm ${isSelected ? "text-brown font-medium" : "text-brown/70"}`}>
                                {option.name}
                              </span>
                            </div>
                            {option.priceAdd > 0 && (
                              <span className="text-brown/40 font-body text-sm">
                                +${option.priceAdd.toFixed(2)}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Allergy Notes */}
              <div className="px-5 sm:px-6 pb-5">
                <h3 className="font-display text-base text-brown mb-2">Special Instructions</h3>
                <textarea
                  value={allergyNotes}
                  onChange={(e) => setAllergyNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-surface border border-black/5 rounded-xl px-4 py-3 text-brown font-body text-sm focus:outline-none focus:border-gold/50 transition-colors resize-none"
                  placeholder="Allergies, preferences..."
                />
              </div>

              {/* Quantity + Add to Cart */}
              <div className="sticky bottom-0 bg-white border-t border-black/5 px-5 sm:px-6 py-4">
                <div className="flex items-center gap-4">
                  {/* Quantity selector */}
                  <div className="flex items-center bg-surface rounded-xl border border-black/5">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2.5 text-brown/50 hover:text-brown transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="px-2 text-brown font-body font-medium text-sm tabular-nums">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2.5 text-brown/50 hover:text-brown transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>

                  {/* Add button */}
                  <button
                    onClick={handleAdd}
                    disabled={!validation.valid}
                    className="flex-1 py-3.5 bg-brown text-white font-display text-sm rounded-xl hover:bg-brown-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add {quantity > 1 ? `${quantity} ` : ""}to Cart · ${totalPrice.toFixed(2)}
                  </button>
                </div>
              </div>
            </div>
        </div>
      </div>
    </>
  );
}
