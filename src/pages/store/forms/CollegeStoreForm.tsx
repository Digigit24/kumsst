/**
 * College Store Form - Create/Edit college stores
 */

import { CollegeField } from '@/components/common/CollegeField';
import { UserSearchableDropdown } from '@/components/common/UserSearchableDropdown';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import type { CollegeStore, CollegeStoreCreateInput } from '@/types/store.types';
import { getCurrentUserCollege } from '@/utils/auth.utils';
import { Controller, useForm } from 'react-hook-form';

interface CollegeStoreFormProps {
    store?: CollegeStore | null;
    onSubmit: (data: any) => void;
    onCancel: () => void;
}

export const CollegeStoreForm = ({ store, onSubmit, onCancel }: CollegeStoreFormProps) => {
    const { user } = useAuth();
    const userCollege = getCurrentUserCollege(user);

    const { register, handleSubmit, formState: { errors }, control, trigger } = useForm<CollegeStoreCreateInput>({
        defaultValues: {
            name: store?.name || '',
            code: store?.code || '',
            college: store?.college || (userCollege ?? undefined),
            address_line1: store?.address_line1 || '',
            address_line2: store?.address_line2 || '',
            city: store?.city || '',
            state: store?.state || '',
            pincode: store?.pincode || '',
            contact_phone: store?.contact_phone || '',
            contact_email: store?.contact_email || '',
            manager: store?.manager || null,
            is_active: store?.is_active ?? true,
        },
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* College Field */}
            {/* College Field */}
            <Controller
                name="college"
                control={control}
                rules={{ required: 'College is required' }}
                render={({ field }) => (
                    <CollegeField
                        value={field.value ?? null}
                        onChange={field.onChange}
                        error={errors.college?.message}
                        required
                    />
                )}
            />

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="name">Store Name *</Label>
                    <Input
                        id="name"
                        {...register('name', { required: 'Store name is required' })}
                    />
                    {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
                </div>

                <div>
                    <Label htmlFor="code">Store Code *</Label>
                    <Input
                        id="code"
                        {...register('code', { required: 'Store code is required' })}
                    />
                    {errors.code && <p className="text-sm text-red-500 mt-1">{errors.code.message}</p>}
                </div>
            </div>

            <div>
                <Label htmlFor="address_line1">Address Line 1 *</Label>
                <Input
                    id="address_line1"
                    {...register('address_line1', { required: 'Address is required' })}
                />
                {errors.address_line1 && <p className="text-sm text-red-500 mt-1">{errors.address_line1.message}</p>}
            </div>

            <div>
                <Label htmlFor="address_line2">Address Line 2</Label>
                <Input
                    id="address_line2"
                    {...register('address_line2')}
                />
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                        id="city"
                        {...register('city', { required: 'City is required' })}
                    />
                    {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city.message}</p>}
                </div>

                <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                        id="state"
                        {...register('state', { required: 'State is required' })}
                    />
                    {errors.state && <p className="text-sm text-red-500 mt-1">{errors.state.message}</p>}
                </div>

                <div>
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                        id="pincode"
                        {...register('pincode', { required: 'Pincode is required' })}
                    />
                    {errors.pincode && <p className="text-sm text-red-500 mt-1">{errors.pincode.message}</p>}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="contact_phone">Contact Phone *</Label>
                    <Input
                        id="contact_phone"
                        {...register('contact_phone', { required: 'Phone is required' })}
                    />
                    {errors.contact_phone && <p className="text-sm text-red-500 mt-1">{errors.contact_phone.message}</p>}
                </div>

                <div>
                    <Label htmlFor="contact_email">Contact Email *</Label>
                    <Input
                        id="contact_email"
                        type="email"
                        {...register('contact_email', { required: 'Email is required' })}
                    />
                    {errors.contact_email && <p className="text-sm text-red-500 mt-1">{errors.contact_email.message}</p>}
                </div>
            </div>

            <div>
                <Controller
                    name="manager"
                    control={control}
                    rules={{ required: 'Manager is required' }}
                    render={({ field }) => (
                        <UserSearchableDropdown
                            value={field.value ? String(field.value) : undefined}
                            onChange={(val) => field.onChange(val)}
                            userType="staff"
                            required
                            label="Store Manager"
                            placeholder="Search and select manager..."
                            error={errors.manager?.message}
                        />
                    )}
                />
            </div>

            <div className="flex items-center space-x-2">
                <Switch
                    id="is_active"
                    defaultChecked={store?.is_active ?? true}
                    onCheckedChange={(checked) => {
                        // Need to manually handle switch since it's not a native input
                        // But register can work if we use Controller, skipping for brevity or could use Controller if needed.
                        // Actually, best to use Controller for switch or rely on register with type="checkbox" but shadcn Switch is separate.
                        // I'll leave as simple Switch with name for now if it works, usually Controller is needed.
                    }}
                />
                {/* Re-implementing Switch with Controller to be safe */}
                <Controller
                    name="is_active"
                    control={control}
                    render={({ field }) => (
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="is_active"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                            <Label htmlFor="is_active">Active</Label>
                        </div>
                    )}
                />
            </div>

            <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                    {store ? 'Update' : 'Create'} Store
                </Button>
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
            </div>
        </form>
    );
};
